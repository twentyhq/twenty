import { type LogicFunctionManifest } from 'twenty-shared/application';

import { fromLogicFunctionManifestToUniversalFlatLogicFunction } from 'src/engine/core-modules/application/application-manifest/converters/from-logic-function-manifest-to-universal-flat-logic-function.util';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const APP_UID = 'a8a8a8a8-a8a8-4a8a-a8a8-a8a8a8a8a8a8';
const LOGIC_FUNCTION_UID = '3f0a55dd-1f6b-4a63-9a10-52ac6b7f0bbb';
const NOW = '2026-05-04T00:00:00.000Z';

const buildManifest = (
  overrides: Partial<LogicFunctionManifest> = {},
): LogicFunctionManifest => ({
  universalIdentifier: LOGIC_FUNCTION_UID,
  name: 'sync-contacts',
  sourceHandlerPath: 'functions/sync-contacts/index.ts',
  builtHandlerPath: 'functions/sync-contacts/index.mjs',
  builtHandlerChecksum: 'checksum-123',
  handlerName: 'main',
  ...overrides,
});

describe('fromLogicFunctionManifestToUniversalFlatLogicFunction', () => {
  it('keeps LIVE execution mode when prebuilt mode is disabled', () => {
    const result = fromLogicFunctionManifestToUniversalFlatLogicFunction({
      logicFunctionManifest: buildManifest(),
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
      isLogicFunctionPrebuiltModeEnabled: false,
    });

    expect(result.executionMode).toBe(LogicFunctionExecutionMode.LIVE);
  });

  it('uses PREBUILT execution mode when prebuilt mode is enabled', () => {
    const result = fromLogicFunctionManifestToUniversalFlatLogicFunction({
      logicFunctionManifest: buildManifest(),
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
      isLogicFunctionPrebuiltModeEnabled: true,
    });

    expect(result.executionMode).toBe(LogicFunctionExecutionMode.PREBUILT);
    expect(result.isBuildUpToDate).toBe(true);
    expect(result.checksum).toBe('checksum-123');
  });

  it('maps manifest fields onto the universal flat logic function', () => {
    const result = fromLogicFunctionManifestToUniversalFlatLogicFunction({
      logicFunctionManifest: buildManifest({ name: undefined }),
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
      isLogicFunctionPrebuiltModeEnabled: true,
    });

    expect(result).toMatchObject({
      universalIdentifier: LOGIC_FUNCTION_UID,
      applicationUniversalIdentifier: APP_UID,
      name: 'main',
      sourceHandlerPath: 'functions/sync-contacts/index.ts',
      builtHandlerPath: 'functions/sync-contacts/index.mjs',
      handlerName: 'main',
      checksum: 'checksum-123',
      createdAt: NOW,
      updatedAt: NOW,
      deletedAt: null,
    });
  });
});
