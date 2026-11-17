import { Test } from '@nestjs/testing';
import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import { type LogicFunctionManifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

import { fromLogicFunctionManifestToUniversalFlatLogicFunction } from 'src/engine/core-modules/application/application-manifest/converters/from-logic-function-manifest-to-universal-flat-logic-function.util';
import { ApplicationLogicFunctionExportService } from 'src/engine/core-modules/application/application-manifest/services/application-logic-function-export.service';
import { ApplicationSourceService } from 'src/engine/core-modules/application/application-manifest/services/application-source.service';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const identifier = '11111111-1111-4111-8111-111111111111';
const otherIdentifier = '22222222-2222-4222-8222-222222222222';
const sourcePath = 'src/functions/greet.ts';
const helperPath = 'src/shared/message.ts';
const source = `import { message } from '../shared/message'; export const handler = () => message;`;
const helper = 'export const message = "Hello from a shared helper";';
const checksum = (content: string) =>
  createHash('md5').update(content).digest('hex');
const logicFunctionManifest: LogicFunctionManifest = {
  universalIdentifier: identifier,
  name: 'Greet',
  description: 'Greeting function',
  timeoutSeconds: 15,
  cronTriggerSettings: { pattern: '0 9 * * *' },
  sourceHandlerPath: sourcePath,
  builtHandlerPath: 'src/functions/greet.mjs',
  builtHandlerChecksum: 'bundle-checksum',
  handlerName: 'handler',
  sourceFiles: [
    { filePath: sourcePath, checksum: checksum(source) },
    { filePath: helperPath, checksum: checksum(helper) },
  ],
};
const maps = createEmptyAllFlatEntityMaps();
const toFlat = (manifest: LogicFunctionManifest): FlatLogicFunction => ({
  ...fromLogicFunctionManifestToUniversalFlatLogicFunction({
    logicFunctionManifest: manifest,
    applicationUniversalIdentifier: identifier,
    applicationSourceType: ApplicationRegistrationSourceType.LOCAL,
    existingFlatLogicFunctionMaps: maps.flatLogicFunctionMaps,
    connectionFlowLogicFunctionUniversalIdentifiers: new Set(),
    now: '2026-11-17T00:00:00.000Z',
  }),
  id: manifest.universalIdentifier,
  workspaceId: identifier,
  applicationId: identifier,
});

describe('logic function source export', () => {
  const storedFiles = new Map<string, Buffer>();
  const storage = {
    checkFileExists: jest.fn(async ({ fileFolder, resourcePath }) =>
      storedFiles.has(`${fileFolder}/${resourcePath}`),
    ),
    readFile: jest.fn(async ({ fileFolder, resourcePath }) =>
      Readable.from([storedFiles.get(`${fileFolder}/${resourcePath}`)!]),
    ),
    writeFile: jest.fn(async ({ fileFolder, resourcePath, sourceFile }) => {
      storedFiles.set(`${fileFolder}/${resourcePath}`, Buffer.from(sourceFile));
    }),
  };
  const cache = { getOrRecompute: jest.fn() };
  let service: ApplicationLogicFunctionExportService;
  let sources: ApplicationSourceService;
  let functions: FlatLogicFunction[];
  const flatMaps = () => ({
    ...maps,
    flatLogicFunctionMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: functions,
      flatEntityMaps: maps.flatLogicFunctionMaps,
    }),
  });
  const store = async (logicFunctions = [logicFunctionManifest]) => {
    cache.getOrRecompute.mockResolvedValue(flatMaps());
    await sources.store({
      workspaceId: identifier,
      manifest: {
        application: { universalIdentifier: identifier },
        logicFunctions,
      },
    });
  };
  const run = ({ include = true, budget = 100_000 } = {}) =>
    service.exportLogicFunctions({
      workspaceId: identifier,
      applicationUniversalIdentifier: identifier,
      applicationAllFlatEntityMaps: flatMaps(),
      shouldIncludeLogicFunctionSources: include,
      fileBudget: { remainingBytes: budget },
      exportedFiles: [],
    });
  beforeEach(async () => {
    jest.clearAllMocks();
    storedFiles.clear();
    storedFiles.set(`${FileFolder.Source}/${sourcePath}`, Buffer.from(source));
    storedFiles.set(`${FileFolder.Source}/${helperPath}`, Buffer.from(helper));
    functions = [toFlat(logicFunctionManifest)];
    const module = await Test.createTestingModule({
      providers: [
        ApplicationLogicFunctionExportService,
        ApplicationSourceService,
        { provide: FileStorageService, useValue: storage },
        { provide: WorkspaceCacheService, useValue: cache },
      ],
    }).compile();
    service = module.get(ApplicationLogicFunctionExportService);
    sources = module.get(ApplicationSourceService);
  });
  it('exports original sources and shared imports once, preserving function metadata', async () => {
    const second = {
      ...logicFunctionManifest,
      universalIdentifier: otherIdentifier,
      sourceHandlerPath: 'src/functions/other.ts',
      sourceFiles: [
        { filePath: 'src/functions/other.ts', checksum: checksum(source) },
        { filePath: helperPath, checksum: checksum(helper) },
      ],
    };
    functions.push(toFlat(second));
    storedFiles.set(
      `${FileFolder.Source}/src/functions/other.ts`,
      Buffer.from(source),
    );
    await store([logicFunctionManifest, second]);
    const result = await run();
    expect(result.logicFunctions).toEqual([logicFunctionManifest, second]);
    expect(result.coverage.every((entry) => entry.status === 'EXPORTED')).toBe(
      true,
    );
    expect(result.files.map((file) => file.path)).toEqual([
      sourcePath,
      helperPath,
      'src/functions/other.ts',
    ]);
    expect(result.files[0].content).toBe(source);
    expect(Buffer.from(result.files[1].content, 'base64').toString()).toBe(
      helper,
    );
  });
  it('keeps old clients opted out without reading storage', async () => {
    expect(await run({ include: false })).toEqual({
      logicFunctions: [],
      files: [],
      coverage: [],
    });
    expect(storage.readFile).not.toHaveBeenCalled();
  });
  it('reports a coverage gap for functions without an inventory', async () => {
    const result = await run();
    expect(result.logicFunctions).toEqual([]);
    expect(result.coverage[0]).toMatchObject({
      status: 'UNSUPPORTED',
      reason: expect.stringContaining('inventory is missing'),
    });
  });
  it.each(['missing', 'changed'])(
    'rejects %s helper bytes without exporting a partial function',
    async (mode) => {
      await store();
      if (mode === 'missing') {
        storedFiles.delete(`${FileFolder.Source}/${helperPath}`);
      } else {
        storedFiles.set(
          `${FileFolder.Source}/${helperPath}`,
          Buffer.from('changed'),
        );
      }
      expect(await run()).toMatchObject({
        logicFunctions: [],
        files: [],
        coverage: [{ status: 'UNSUPPORTED' }],
      });
    },
  );
  it('does not overwrite metadata edited in the workspace with the old definition', async () => {
    await store();
    functions[0] = { ...functions[0], timeoutSeconds: 20 };
    expect(await run()).toMatchObject({
      logicFunctions: [],
      files: [],
      coverage: [
        {
          status: 'UNSUPPORTED',
          reason: expect.stringContaining('does not match'),
        },
      ],
    });
  });
  it('clears an old inventory when a legacy CLI sync omits it', async () => {
    await store();
    await store([{ ...logicFunctionManifest, sourceFiles: undefined }]);
    expect(await run()).toMatchObject({
      logicFunctions: [],
      files: [],
      coverage: [{ status: 'UNSUPPORTED' }],
    });
  });
  it('shares the encoded file budget with other exported files', async () => {
    await store();
    const result = await run();
    const size = Buffer.byteLength(JSON.stringify(result.files));
    expect((await run({ budget: size })).logicFunctions).toHaveLength(1);
    expect(await run({ budget: size - 1 })).toMatchObject({
      logicFunctions: [],
      files: [],
      coverage: [{ status: 'UNSUPPORTED' }],
    });
  });
  it('propagates storage outages', async () => {
    await store();
    storage.readFile.mockRejectedValueOnce(new Error('storage unavailable'));
    await expect(run()).rejects.toThrow('storage unavailable');
  });
});
