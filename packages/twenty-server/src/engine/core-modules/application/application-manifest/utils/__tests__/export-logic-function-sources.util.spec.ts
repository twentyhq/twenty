import { createHash } from 'node:crypto';
import { type LogicFunctionManifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

import { fromLogicFunctionManifestToUniversalFlatLogicFunction } from 'src/engine/core-modules/application/application-manifest/converters/from-logic-function-manifest-to-universal-flat-logic-function.util';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { exportLogicFunctionSources } from 'src/engine/core-modules/application/application-manifest/utils/export-logic-function-sources.util';
import { getApplicationSourceResources } from 'src/engine/core-modules/application/application-manifest/utils/get-application-source-resources.util';
import { validateApplicationSourceInventoryOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/validate-application-source-inventory-or-throw.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const identifier = '11111111-1111-4111-8111-111111111111';
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
  const sourceFiles = logicFunctionManifest.sourceFiles!;
  const files = [
    { folder: FileFolder.Source, path: sourcePath, content: source },
    {
      folder: FileFolder.Source,
      path: helperPath,
      content: Buffer.from(helper).toString('base64'),
      encoding: 'base64' as const,
    },
  ];
  const readSource = jest.fn();
  let functions: FlatLogicFunction[];
  const flatMaps = () => ({
    ...maps,
    flatLogicFunctionMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: functions,
      flatEntityMaps: maps.flatLogicFunctionMaps,
    }),
  });
  const run = ({
    shouldInclude = true,
    budget = 100_000,
    exportedFiles = [],
  }: {
    shouldInclude?: boolean;
    budget?: number;
    exportedFiles?: typeof files;
  } = {}) =>
    exportLogicFunctionSources({
      workspaceId: identifier,
      applicationUniversalIdentifier: identifier,
      applicationAllFlatEntityMaps: flatMaps(),
      shouldIncludeLogicFunctionSources: shouldInclude,
      fileBudget: { remainingBytes: budget },
      exportedFiles,
      readSource,
    });

  beforeEach(() => {
    readSource.mockReset().mockResolvedValue({ sourceFiles, files });
    functions = [toFlat(logicFunctionManifest)];
  });

  it('preserves function metadata and does not export a shared import twice', async () => {
    const result = await run({ exportedFiles: [files[1]] });
    expect(result.logicFunctions).toEqual([logicFunctionManifest]);
    expect(result.files).toEqual([files[0]]);
    expect(result.coverage).toEqual([
      {
        metadataName: 'logicFunction',
        universalIdentifier: identifier,
        status: 'EXPORTED',
      },
    ]);
    expect(readSource.mock.calls[0][0].resource.metadata).toEqual({
      updatedAt: functions[0].updatedAt,
    });
  });

  it('keeps old clients opted out without reading storage', async () => {
    expect(await run({ shouldInclude: false })).toEqual({
      logicFunctions: [],
      files: [],
      coverage: [],
    });
    expect(readSource).not.toHaveBeenCalled();
  });

  it('reports a coverage gap for missing inventories', async () => {
    readSource.mockResolvedValue(undefined);
    expect(await run()).toMatchObject({
      logicFunctions: [],
      files: [],
      coverage: [
        {
          status: 'UNSUPPORTED',
          reason: expect.stringContaining('inventory is missing'),
        },
      ],
    });
  });

  it.each([
    { checksum: null },
    { isBuildUpToDate: false },
    { sourceHandlerPath: '../outside.ts' },
  ])(
    'reports a coverage gap without reading sources for %s',
    async (change) => {
      functions[0] = { ...functions[0], ...change };
      expect(await run()).toMatchObject({
        logicFunctions: [],
        files: [],
        coverage: [{ status: 'UNSUPPORTED' }],
      });
      expect(readSource).not.toHaveBeenCalled();
    },
  );

  it('reports an invalid inventory without exporting partial sources', async () => {
    readSource.mockRejectedValue(
      new ApplicationException(
        'Source file is missing or changed',
        ApplicationExceptionCode.INVALID_INPUT,
      ),
    );
    expect(await run()).toMatchObject({
      logicFunctions: [],
      files: [],
      coverage: [
        { status: 'UNSUPPORTED', reason: 'Source file is missing or changed' },
      ],
    });
  });

  it('shares the encoded file budget with other exported files', async () => {
    const size = Buffer.byteLength(JSON.stringify(files));
    expect((await run({ budget: size })).logicFunctions).toHaveLength(1);
    expect(await run({ budget: size - 1 })).toMatchObject({
      logicFunctions: [],
      files: [],
      coverage: [{ status: 'UNSUPPORTED' }],
    });
  });

  it('propagates storage outages on export', async () => {
    readSource.mockRejectedValue(new Error('storage unavailable'));
    await expect(run()).rejects.toThrow('storage unavailable');
  });

  it('uses the deployed revision, independent of manifest converter defaults', () => {
    const resource = getApplicationSourceResources({
      manifest: { logicFunctions: [logicFunctionManifest] },
      flatLogicFunctionMaps: flatMaps().flatLogicFunctionMaps,
    })[0];
    const inventory = { ...resource.metadata, sourceFiles };
    const changedDefaults = getApplicationSourceResources({
      manifest: {
        logicFunctions: [{ ...logicFunctionManifest, timeoutSeconds: 999 }],
      },
      flatLogicFunctionMaps: flatMaps().flatLogicFunctionMaps,
    })[0];
    expect(
      validateApplicationSourceInventoryOrThrow({
        inventory,
        resource: changedDefaults,
      }),
    ).toEqual(sourceFiles);
    functions[0] = { ...functions[0], updatedAt: '2026-11-18T00:00:00.000Z' };
    const updated = getApplicationSourceResources({
      manifest: { logicFunctions: [logicFunctionManifest] },
      flatLogicFunctionMaps: flatMaps().flatLogicFunctionMaps,
    })[0];
    expect(() =>
      validateApplicationSourceInventoryOrThrow({
        inventory,
        resource: updated,
      }),
    ).toThrow('does not match');
  });

  it('invalidates an old inventory when the synchronized function is absent', () => {
    functions = [];
    const resource = getApplicationSourceResources({
      manifest: { logicFunctions: [logicFunctionManifest] },
      flatLogicFunctionMaps: flatMaps().flatLogicFunctionMaps,
    })[0];
    expect(resource.sourceFiles).toBeUndefined();
    expect(
      validateApplicationSourceInventoryOrThrow({
        resource,
        inventory: {
          ...resource.metadata,
          sourceFiles: resource.sourceFiles ?? null,
        },
      }),
    ).toBeUndefined();
  });
});
