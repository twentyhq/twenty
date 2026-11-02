import { Readable } from 'node:stream';
import { buildFrontComponentEntrySource } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-entry-source.util';
import { type ApplicationExportFile } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { PageLayoutType, FileFolder } from 'twenty-shared/types';
import { ApplicationFrontComponentExportService } from 'src/engine/core-modules/application/application-manifest/services/application-front-component-export.service';
import { fromFrontComponentManifestToUniversalFlatFrontComponent } from 'src/engine/core-modules/application/application-manifest/converters/from-front-component-manifest-to-universal-flat-front-component.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';

const identifier = '11111111-1111-4111-8111-111111111111';
const sourcePath = 'src/components/hello.tsx';
const source = `import { defineFrontComponent } from 'twenty-sdk/define';
const Hello = () => <div>Hello</div>;
export default defineFrontComponent({ universalIdentifier: '${identifier}', component: Hello });`;
const frontComponentManifest = {
  universalIdentifier: identifier,
  name: 'Hello',
  sourceComponentPath: sourcePath,
  builtComponentPath: 'src/components/hello.mjs',
  builtComponentChecksum: 'checksum',
  componentName: 'Hello',
  isHeadless: false,
  usesSdkClient: false,
};
const component = {
  ...fromFrontComponentManifestToUniversalFlatFrontComponent({
    frontComponentManifest,
    applicationUniversalIdentifier: identifier,
    isSettingsFrontComponent: false,
    now: '2026-11-02T00:00:00.000Z',
  }),
  id: identifier,
  workspaceId: identifier,
  applicationId: identifier,
  widgetAvailability: [],
};
const maps = createEmptyAllFlatEntityMaps();
const applicationAllFlatEntityMaps = {
  ...maps,
  flatFrontComponentMaps: addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: [component],
    flatEntityMaps: maps.flatFrontComponentMaps,
  }),
};

describe('ApplicationFrontComponentExportService', () => {
  const storage = { checkFileExists: jest.fn(), readFile: jest.fn() };
  const service = new ApplicationFrontComponentExportService(
    storage as unknown as FileStorageService,
  );
  const run = (
    shouldIncludeSourceFiles = true,
    dependencyFiles: ApplicationExportFile[] = [],
  ) =>
    service.exportFrontComponents({
      workspaceId: identifier,
      applicationUniversalIdentifier: identifier,
      applicationAllFlatEntityMaps,
      dependencyFiles,
      shouldIncludeSourceFiles,
    });
  beforeEach(() => {
    jest.useRealTimers();
    storage.checkFileExists.mockResolvedValue(true);
    storage.readFile.mockImplementation(async () =>
      Readable.from([Buffer.from(source)]),
    );
  });
  it('returns exact authorable source only from the component source path', async () => {
    const result = await run();
    expect(result.frontComponents).toEqual([frontComponentManifest]);
    expect(result.files).toEqual([
      { folder: FileFolder.Source, path: sourcePath, content: source },
    ]);
    expect(result.coverage[0].status).toBe('EXPORTED');
    expect(storage.readFile).toHaveBeenCalledWith({
      workspaceId: identifier,
      applicationUniversalIdentifier: identifier,
      fileFolder: FileFolder.Source,
      resourcePath: sourcePath,
    });
  });
  it('accepts the actual AI-generated entry source with workspace dependencies', async () => {
    const entrySource = buildFrontComponentEntrySource({
      componentId: identifier,
      name: 'Hello',
      source: 'export const Component = () => <div>Hello</div>;',
      pageLayoutType: PageLayoutType.DASHBOARD,
    });
    storage.readFile.mockImplementation(async () =>
      Readable.from([Buffer.from(entrySource)]),
    );
    const result = await run(true, [
      {
        folder: FileFolder.Dependencies,
        path: 'package.json',
        content: JSON.stringify({
          dependencies: {
            react: '19.0.0',
            'react-dom': '19.0.0',
            'twenty-ui': '2.55.0',
          },
        }),
      },
    ]);
    expect(result.coverage[0].status).toBe('EXPORTED');
    expect(result.files[0].content).toBe(entrySource);
  });
  it('keeps source bytes out of metadata-only exports', async () => {
    expect((await run(false)).files).toEqual([]);
  });
  it('reports missing source rather than a restorable component', async () => {
    storage.checkFileExists.mockResolvedValue(false);
    const result = await run();
    expect(result.frontComponents).toEqual([]);
    expect(result.files).toEqual([]);
    expect(result.coverage[0]).toMatchObject({
      status: 'UNSUPPORTED',
      reason: expect.stringContaining('source file is missing'),
    });
  });
  it('does not export a component requiring unexported helpers', async () => {
    storage.readFile.mockImplementation(async () =>
      Readable.from([
        Buffer.from(`import type { Props } from './props';\n${source}`),
      ]),
    );
    expect((await run()).coverage[0]).toMatchObject({
      status: 'UNSUPPORTED',
      reason: expect.stringContaining('local imports'),
    });
  });
  it('surfaces storage failures instead of silently omitting source', async () => {
    storage.readFile.mockRejectedValue(new Error('storage unavailable'));
    await expect(run()).rejects.toThrow('storage unavailable');
  });
});
