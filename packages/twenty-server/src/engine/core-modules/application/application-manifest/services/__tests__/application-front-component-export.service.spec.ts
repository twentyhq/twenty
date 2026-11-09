import { Readable } from 'node:stream';
import { Test } from '@nestjs/testing';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { buildFrontComponentEntrySource } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-entry-source.util';
import { PageLayoutType, FileFolder } from 'twenty-shared/types';
import { ApplicationFrontComponentExportService } from 'src/engine/core-modules/application/application-manifest/services/application-front-component-export.service';
import { fromFrontComponentManifestToUniversalFlatFrontComponent } from 'src/engine/core-modules/application/application-manifest/converters/from-front-component-manifest-to-universal-flat-front-component.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';

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

describe('ApplicationFrontComponentExportService', () => {
  const storage = { checkFileExists: jest.fn(), readFile: jest.fn() };
  let service: ApplicationFrontComponentExportService;
  const run = ({
    shouldIncludeSourceFiles = true,
    frontComponent = component,
  }: {
    shouldIncludeSourceFiles?: boolean;
    frontComponent?: FlatFrontComponent;
  } = {}) =>
    service.exportFrontComponents({
      workspaceId: identifier,
      applicationUniversalIdentifier: identifier,
      applicationAllFlatEntityMaps: {
        ...maps,
        flatFrontComponentMaps: addAllFlatEntitiesToFlatEntityMaps({
          flatEntities: [frontComponent],
          flatEntityMaps: maps.flatFrontComponentMaps,
        }),
      },
      shouldIncludeSourceFiles,
    });
  beforeEach(async () => {
    jest.useRealTimers();
    const module = await Test.createTestingModule({
      providers: [
        ApplicationFrontComponentExportService,
        { provide: FileStorageService, useValue: storage },
      ],
    }).compile();
    service = module.get(ApplicationFrontComponentExportService);
    storage.checkFileExists.mockReset();
    storage.readFile.mockReset();
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
    expect(storage.readFile).toHaveBeenCalledTimes(1);
    expect(storage.readFile).toHaveBeenCalledWith({
      workspaceId: identifier,
      applicationUniversalIdentifier: identifier,
      fileFolder: FileFolder.Source,
      resourcePath: sourcePath,
    });
  });
  it('accepts the actual AI-generated entry source', async () => {
    const entrySource = buildFrontComponentEntrySource({
      componentId: identifier,
      name: 'Hello',
      source: 'export const Component = () => <div>Hello</div>;',
      pageLayoutType: PageLayoutType.DASHBOARD,
    });
    storage.readFile.mockImplementation(async () =>
      Readable.from([Buffer.from(entrySource)]),
    );
    const result = await run();
    expect(result.coverage[0].status).toBe('EXPORTED');
    expect(result.files[0].content).toBe(entrySource);
  });
  it.each([{ name: 'Renamed' }, { description: 'Edited in the workspace' }])(
    'reports source metadata drift for %j',
    async (updates) => {
      const result = await run({
        shouldIncludeSourceFiles: true,
        frontComponent: { ...component, ...updates },
      });
      expect(result.frontComponents).toEqual([]);
      expect(result.files).toEqual([]);
      expect(result.coverage).toEqual([
        expect.objectContaining({
          universalIdentifier: identifier,
          status: 'UNSUPPORTED',
          reason: expect.stringContaining('does not match stored metadata'),
        }),
      ]);
    },
  );
  it('accepts matching literal metadata', async () => {
    storage.readFile.mockImplementation(async () =>
      Readable.from([
        Buffer.from(
          source.replace(
            'component: Hello',
            'name: "Named", description: "Details", component: Hello',
          ),
        ),
      ]),
    );
    expect(
      (
        await run({
          shouldIncludeSourceFiles: true,
          frontComponent: {
            ...component,
            name: 'Named',
            description: 'Details',
          },
        })
      ).coverage[0].status,
    ).toBe('EXPORTED');
  });
  it('reports unresolved object restrictions instead of exporting unrestricted availability', async () => {
    const result = await run({
      shouldIncludeSourceFiles: true,
      frontComponent: {
        ...component,
        universalWidgetAvailability: [
          {
            pageLayoutType: PageLayoutType.RECORD_PAGE,
            objectMetadataUniversalIdentifier: null,
          },
        ],
      },
    });
    expect(result.frontComponents).toEqual([]);
    expect(result.files).toEqual([]);
    expect(result.coverage[0]).toMatchObject({
      status: 'UNSUPPORTED',
      reason: expect.stringContaining('widget availability'),
    });
    expect(storage.readFile).not.toHaveBeenCalled();
  });
  it('retains unrestricted record page availability', async () => {
    const result = await run({
      shouldIncludeSourceFiles: true,
      frontComponent: {
        ...component,
        universalWidgetAvailability: [
          { pageLayoutType: PageLayoutType.RECORD_PAGE },
        ],
      },
    });
    expect(result.frontComponents[0].widgetAvailability).toEqual({
      pageLayoutType: PageLayoutType.RECORD_PAGE,
    });
  });
  it('keeps components out of metadata-only exports without reading storage', async () => {
    expect(await run({ shouldIncludeSourceFiles: false })).toEqual({
      frontComponents: [],
      files: [],
      coverage: [],
    });
    expect(storage.checkFileExists).not.toHaveBeenCalled();
    expect(storage.readFile).not.toHaveBeenCalled();
  });
  it.each(['C:/escape.tsx', 'c:escape.tsx'])(
    'reports a coverage gap for drive-qualified source path %s without accessing storage',
    async (sourceComponentPath) => {
      const result = await run({
        frontComponent: { ...component, sourceComponentPath },
      });
      expect(result.frontComponents).toEqual([]);
      expect(result.files).toEqual([]);
      expect(result.coverage).toEqual([
        {
          metadataName: 'frontComponent',
          universalIdentifier: identifier,
          status: 'UNSUPPORTED',
          reason: 'source path cannot be restored inside an application',
        },
      ]);
      expect(storage.checkFileExists).not.toHaveBeenCalled();
      expect(storage.readFile).not.toHaveBeenCalled();
    },
  );
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
  it.each([
    "import { label } from './helper';",
    "import './style.css';",
    "import 'optional-package/style.css';",
  ])('exports source without resolving imports: %s', async (importSource) => {
    const content = `${importSource}\n${source}`;
    storage.readFile.mockImplementation(async () =>
      Readable.from([Buffer.from(content)]),
    );
    const result = await run();
    expect(result.frontComponents).toEqual([frontComponentManifest]);
    expect(result.files).toEqual([
      { folder: FileFolder.Source, path: sourcePath, content },
    ]);
    expect(result.coverage[0].status).toBe('EXPORTED');
  });
  it('surfaces storage failures instead of silently omitting source', async () => {
    storage.readFile.mockRejectedValue(new Error('storage unavailable'));
    await expect(run()).rejects.toThrow('storage unavailable');
  });
});
