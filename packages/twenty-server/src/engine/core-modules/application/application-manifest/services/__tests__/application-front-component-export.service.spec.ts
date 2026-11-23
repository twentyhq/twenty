import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ApplicationPublicAssetExportService } from 'src/engine/core-modules/application/application-manifest/services/application-public-asset-export.service';
import { APPLICATION_EXPORT_FILE_BUDGET_BYTES } from 'src/engine/core-modules/application/application-manifest/constants/application-export-file-budget-bytes.constant';
import { type ApplicationExportFileBudget } from 'src/engine/core-modules/application/application-manifest/types/application-export-file-budget.type';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { createHash } from 'node:crypto';
import { type Manifest } from 'twenty-shared/application';
import { ApplicationSourceService } from 'src/engine/core-modules/application/application-manifest/services/application-source.service';
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
  const storage = {
    checkFileExists: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  };
  const repository = { find: jest.fn() };
  let assetService: ApplicationPublicAssetExportService;
  let service: ApplicationFrontComponentExportService;
  let sourceService: ApplicationSourceService;
  const run = ({
    shouldIncludeSourceFiles = true,
    shouldIncludeSourceDependencies = true,
    frontComponent = component,
    frontComponents = [frontComponent],
    fileBudget,
  }: {
    shouldIncludeSourceFiles?: boolean;
    shouldIncludeSourceDependencies?: boolean;
    frontComponent?: FlatFrontComponent;
    frontComponents?: FlatFrontComponent[];
    fileBudget?: ApplicationExportFileBudget;
  } = {}) =>
    service.exportFrontComponents({
      workspaceId: identifier,
      applicationUniversalIdentifier: identifier,
      applicationAllFlatEntityMaps: {
        ...maps,
        flatFrontComponentMaps: addAllFlatEntitiesToFlatEntityMaps({
          flatEntities: frontComponents,
          flatEntityMaps: maps.flatFrontComponentMaps,
        }),
      },
      shouldIncludeSourceFiles,
      shouldIncludeSourceDependencies,
      fileBudget,
    });
  beforeEach(async () => {
    jest.useRealTimers();
    const module = await Test.createTestingModule({
      providers: [
        ApplicationFrontComponentExportService,
        ApplicationSourceService,
        { provide: WorkspaceCacheService, useValue: {} },
        ApplicationPublicAssetExportService,
        {
          provide: getWorkspaceScopedRepositoryToken(FileEntity),
          useValue: repository,
        },
        { provide: FileStorageService, useValue: storage },
      ],
    }).compile();
    service = module.get(ApplicationFrontComponentExportService);
    sourceService = module.get(ApplicationSourceService);
    assetService = module.get(ApplicationPublicAssetExportService);
    storage.writeFile.mockReset();
    storage.checkFileExists.mockReset();
    storage.readFile.mockReset();
    storage.checkFileExists.mockImplementation(
      async ({ fileFolder }) => fileFolder === FileFolder.Source,
    );
    storage.readFile.mockImplementation(async () =>
      Readable.from([Buffer.from(source)]),
    );
  });
  const sourceFiles: Record<string, Buffer> = {
    [sourcePath]: Buffer.from(source),
    'src/helper.ts': Buffer.from('export const message = "Hello";'),
    'src/logo.png': Buffer.from([0, 255, 128, 1]),
    'tsconfig.json': Buffer.from('{"compilerOptions":{"jsx":"react-jsx"}}'),
  };
  const inventoryManifest = {
    application: { universalIdentifier: identifier },
    frontComponents: [
      {
        ...frontComponentManifest,
        sourceFiles: Object.entries(sourceFiles).map(([filePath, content]) => ({
          filePath,
          checksum: createHash('md5').update(content).digest('hex'),
        })),
      },
    ],
  } satisfies Pick<Manifest, 'frontComponents'> & {
    application: Pick<Manifest['application'], 'universalIdentifier'>;
  };
  const prepareInventory = async () => {
    const stored = new Map(
      Object.entries(sourceFiles).map(([path, content]) => [
        `source/${path}`,
        content,
      ]),
    );
    stored.set('source/private/logic.ts', Buffer.from('not exported'));
    stored.set('source/stale.ts', Buffer.from('not inventoried'));
    stored.set('attachment/record.pdf', Buffer.from('not exported'));
    storage.checkFileExists.mockImplementation(
      async ({ fileFolder, resourcePath }) =>
        stored.has(`${fileFolder}/${resourcePath}`),
    );
    storage.readFile.mockImplementation(async ({ fileFolder, resourcePath }) =>
      Readable.from([stored.get(`${fileFolder}/${resourcePath}`)]),
    );
    storage.writeFile.mockImplementation(
      async ({ fileFolder, resourcePath, sourceFile }) => {
        stored.set(`${fileFolder}/${resourcePath}`, Buffer.from(sourceFile));
      },
    );
    sourceService.validateOrThrow(inventoryManifest);
    await sourceService.store({
      workspaceId: identifier,
      manifest: inventoryManifest,
    });
    return stored;
  };
  it('exports only the deployed FE inventory with exact text and binary contents', async () => {
    await prepareInventory();
    const result = await run();
    expect(result.coverage[0].status).toBe('EXPORTED');
    expect(result.frontComponents[0].sourceFiles).toEqual(
      inventoryManifest.frontComponents[0].sourceFiles,
    );
    expect(result.files.map((file) => file.path)).toEqual(
      Object.keys(sourceFiles),
    );
    for (const file of result.files) {
      expect(
        Buffer.from(
          file.content,
          file.encoding === 'base64' ? 'base64' : 'utf8',
        ),
      ).toEqual(sourceFiles[file.path]);
    }
  });
  it('exports shared files once and reads them once across components', async () => {
    const stored = await prepareInventory();
    const secondIdentifier = '22222222-2222-4222-8222-222222222222';
    const secondPath = 'src/components/second.tsx';
    const secondSource = Buffer.from(
      source.replace(identifier, secondIdentifier),
    );
    stored.set(`source/${secondPath}`, secondSource);
    const secondManifest = {
      ...inventoryManifest.frontComponents[0],
      universalIdentifier: secondIdentifier,
      sourceComponentPath: secondPath,
      sourceFiles: inventoryManifest.frontComponents[0].sourceFiles?.map(
        (file) =>
          file.filePath === sourcePath
            ? {
                filePath: secondPath,
                checksum: createHash('md5').update(secondSource).digest('hex'),
              }
            : file,
      ),
    };
    await sourceService.store({
      workspaceId: identifier,
      manifest: { ...inventoryManifest, frontComponents: [secondManifest] },
    });
    const result = await run({
      frontComponents: [
        component,
        {
          ...component,
          id: secondIdentifier,
          universalIdentifier: secondIdentifier,
          sourceComponentPath: secondPath,
        },
      ],
    });
    expect(result.frontComponents).toHaveLength(2);
    expect(
      result.files.filter((file) => file.path === 'src/helper.ts'),
    ).toHaveLength(1);
    expect(
      storage.readFile.mock.calls.filter(
        ([location]) => location.resourcePath === 'src/helper.ts',
      ),
    ).toHaveLength(1);
    expect(result.files).toHaveLength(5);
  });

  it.each(['missing', 'changed', 'stale inventory'])(
    'reports %s sources as unsupported without exporting a partial component',
    async (failure) => {
      const stored = await prepareInventory();
      if (failure === 'missing') {
        stored.delete('source/src/helper.ts');
      }
      if (failure === 'changed') {
        stored.set('source/src/helper.ts', Buffer.from('changed'));
      }
      const result = await run({
        frontComponent:
          failure === 'stale inventory'
            ? { ...component, builtComponentChecksum: 'new bundle' }
            : component,
      });
      expect(result.coverage[0].status).toBe('UNSUPPORTED');
      expect(result.frontComponents).toEqual([]);
      expect(result.files).toEqual([]);
    },
  );
  it('shares an encoded response budget between source files and public assets', async () => {
    const stored = await prepareInventory();
    const image = Buffer.alloc(7 * 1024 * 1024);
    stored.set('source/src/logo.png', image);
    await sourceService.store({
      workspaceId: identifier,
      manifest: {
        ...inventoryManifest,
        frontComponents: [
          {
            ...inventoryManifest.frontComponents[0],
            sourceFiles: inventoryManifest.frontComponents[0].sourceFiles.map(
              (file) =>
                file.filePath === 'src/logo.png'
                  ? {
                      ...file,
                      checksum: createHash('md5').update(image).digest('hex'),
                    }
                  : file,
            ),
          },
        ],
      },
    });
    const fileBudget = { remainingBytes: APPLICATION_EXPORT_FILE_BUDGET_BYTES };
    const sources = await run({ fileBudget });
    expect(sources.frontComponents).toHaveLength(1);
    stored.set('public-asset/public/large.png', image);
    stored.set('public-asset/public/small.png', Buffer.from([0, 255]));
    repository.find.mockResolvedValue([
      { id: 'large', path: 'public-asset/public/large.png' },
      { id: 'small', path: 'public-asset/public/small.png' },
    ]);
    const assets = await assetService.exportPublicAssets({
      workspaceId: identifier,
      applicationId: identifier,
      applicationUniversalIdentifier: identifier,
      fileBudget,
    });
    expect(assets.files.map((file) => file.path)).toEqual(['public/small.png']);
    expect(assets.coverage[0]).toMatchObject({
      universalIdentifier: 'large',
      status: 'UNSUPPORTED',
    });
    expect(
      Buffer.byteLength(JSON.stringify([...sources.files, ...assets.files])),
    ).toBeLessThan(APPLICATION_EXPORT_FILE_BUDGET_BYTES);
  });

  it.each(['oversized', 'escaped'])(
    'reports a %s legacy entry as a coverage gap and continues',
    async (failure) => {
      const secondIdentifier = '22222222-2222-4222-8222-222222222222';
      const secondPath = 'src/components/second.tsx';
      const firstSource =
        failure === 'oversized'
          ? source + ' '.repeat(5000)
          : source + '/*' + '\0'.repeat(3000) + '*/';
      storage.readFile.mockImplementation(async ({ resourcePath }) =>
        Readable.from([
          Buffer.from(
            resourcePath === sourcePath
              ? firstSource
              : source.replace(identifier, secondIdentifier),
          ),
        ]),
      );
      const result = await run({
        fileBudget: { remainingBytes: 4000 },
        frontComponents: [
          component,
          {
            ...component,
            id: secondIdentifier,
            universalIdentifier: secondIdentifier,
            sourceComponentPath: secondPath,
          },
        ],
      });
      expect(result.coverage[0].status).toBe('UNSUPPORTED');
      expect(
        result.frontComponents.map((entry) => entry.universalIdentifier),
      ).toEqual([secondIdentifier]);
      expect(result.files.map((file) => file.path)).toEqual([secondPath]);
    },
  );

  it('keeps entry-only exports compatible for clients that did not request dependencies', async () => {
    await prepareInventory();
    const result = await run({ shouldIncludeSourceDependencies: false });
    expect(result.frontComponents[0].sourceFiles).toBeUndefined();
    expect(result.files).toEqual([
      { folder: FileFolder.Source, path: sourcePath, content: source },
    ]);
  });
  it('clears a previous inventory when a legacy client resyncs the component', async () => {
    await prepareInventory();
    await sourceService.store({
      workspaceId: identifier,
      manifest: {
        ...inventoryManifest,
        frontComponents: [frontComponentManifest],
      },
    });
    expect((await run()).files).toEqual([
      { folder: FileFolder.Source, path: sourcePath, content: source },
    ]);
  });
  it('rejects unsafe inventories before sync', () => {
    expect(() =>
      sourceService.validateOrThrow({
        ...inventoryManifest,
        frontComponents: [
          {
            ...frontComponentManifest,
            sourceFiles: [
              { filePath: '../outside.ts', checksum: '0'.repeat(32) },
            ],
          },
        ],
      }),
    ).toThrow('Invalid source inventory');
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
