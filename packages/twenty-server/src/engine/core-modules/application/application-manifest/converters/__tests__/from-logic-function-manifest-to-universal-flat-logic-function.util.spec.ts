import { type LogicFunctionManifest } from 'twenty-shared/application';

import { fromLogicFunctionManifestToUniversalFlatLogicFunction } from 'src/engine/core-modules/application/application-manifest/converters/from-logic-function-manifest-to-universal-flat-logic-function.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

describe('fromLogicFunctionManifestToUniversalFlatLogicFunction', () => {
  const now = '2026-01-01T00:00:00.000Z';
  const applicationUniversalIdentifier = 'app-uuid-1';
  const logicFunctionUniversalIdentifier = 'fn-uuid-1';

  const buildLogicFunctionManifest = (
    overrides: Partial<LogicFunctionManifest> = {},
  ): LogicFunctionManifest => ({
    universalIdentifier: logicFunctionUniversalIdentifier,
    name: 'My Function',
    handlerName: 'handler',
    sourceHandlerPath: 'src/my-function.ts',
    builtHandlerPath: 'dist/my-function.mjs',
    builtHandlerChecksum: 'checksum-1',
    ...overrides,
  });

  const emptyFlatLogicFunctionMaps =
    createEmptyFlatEntityMaps() as AllFlatEntityMaps['flatLogicFunctionMaps'];

  const buildFlatLogicFunctionMaps = (
    executionMode: LogicFunctionExecutionMode,
  ): AllFlatEntityMaps['flatLogicFunctionMaps'] =>
    ({
      ...emptyFlatLogicFunctionMaps,
      byUniversalIdentifier: {
        [logicFunctionUniversalIdentifier]: {
          universalIdentifier: logicFunctionUniversalIdentifier,
          executionMode,
        } as FlatLogicFunction,
      },
    }) as AllFlatEntityMaps['flatLogicFunctionMaps'];

  const convert = ({
    logicFunctionManifest = buildLogicFunctionManifest(),
    applicationSourceType,
    existingFlatLogicFunctionMaps = emptyFlatLogicFunctionMaps,
    isPrebuiltModeEnabled = true,
  }: {
    logicFunctionManifest?: LogicFunctionManifest;
    applicationSourceType: ApplicationRegistrationSourceType;
    existingFlatLogicFunctionMaps?: AllFlatEntityMaps['flatLogicFunctionMaps'];
    isPrebuiltModeEnabled?: boolean;
  }) =>
    fromLogicFunctionManifestToUniversalFlatLogicFunction({
      logicFunctionManifest,
      applicationUniversalIdentifier,
      applicationSourceType,
      existingFlatLogicFunctionMaps,
      isPrebuiltModeEnabled,
      now,
    });

  it.each([
    ApplicationRegistrationSourceType.TARBALL,
    ApplicationRegistrationSourceType.NPM,
  ])(
    'should set PREBUILT execution mode for a new function of a %s application',
    (applicationSourceType) => {
      const result = convert({ applicationSourceType });

      expect(result.executionMode).toBe(LogicFunctionExecutionMode.PREBUILT);
      expect(result.checksum).toBe('checksum-1');
      expect(result.isBuildUpToDate).toBe(true);
    },
  );

  it.each([
    ApplicationRegistrationSourceType.LOCAL,
    ApplicationRegistrationSourceType.OAUTH_ONLY,
  ])(
    'should keep LIVE execution mode for a new function of a %s application',
    (applicationSourceType) => {
      const result = convert({ applicationSourceType });

      expect(result.executionMode).toBe(LogicFunctionExecutionMode.LIVE);
    },
  );

  it.each([['empty', ''] as const, ['undefined', undefined] as const])(
    'should fall back to LIVE for a packaged application with an %s checksum',
    (_label, builtHandlerChecksum) => {
      const result = convert({
        logicFunctionManifest: buildLogicFunctionManifest({
          builtHandlerChecksum,
        }),
        applicationSourceType: ApplicationRegistrationSourceType.NPM,
      });

      expect(result.executionMode).toBe(LogicFunctionExecutionMode.LIVE);
    },
  );

  it('should keep LIVE execution mode when prebuilt mode is disabled', () => {
    const result = convert({
      applicationSourceType: ApplicationRegistrationSourceType.NPM,
      isPrebuiltModeEnabled: false,
    });

    expect(result.executionMode).toBe(LogicFunctionExecutionMode.LIVE);
  });

  it('should keep the execution mode of an already synced function', () => {
    const result = convert({
      applicationSourceType: ApplicationRegistrationSourceType.NPM,
      existingFlatLogicFunctionMaps: buildFlatLogicFunctionMaps(
        LogicFunctionExecutionMode.LIVE,
      ),
    });

    expect(result.executionMode).toBe(LogicFunctionExecutionMode.LIVE);
  });

  it('should keep PREBUILT on an already synced function even when prebuilt mode is disabled', () => {
    const result = convert({
      applicationSourceType: ApplicationRegistrationSourceType.NPM,
      existingFlatLogicFunctionMaps: buildFlatLogicFunctionMaps(
        LogicFunctionExecutionMode.PREBUILT,
      ),
      isPrebuiltModeEnabled: false,
    });

    expect(result.executionMode).toBe(LogicFunctionExecutionMode.PREBUILT);
  });

  it.each([['empty', ''] as const, ['undefined', undefined] as const])(
    'should demote an already synced PREBUILT function to LIVE when the manifest has an %s checksum',
    (_label, builtHandlerChecksum) => {
      const result = convert({
        logicFunctionManifest: buildLogicFunctionManifest({
          builtHandlerChecksum,
        }),
        applicationSourceType: ApplicationRegistrationSourceType.NPM,
        existingFlatLogicFunctionMaps: buildFlatLogicFunctionMaps(
          LogicFunctionExecutionMode.PREBUILT,
        ),
      });

      expect(result.executionMode).toBe(LogicFunctionExecutionMode.LIVE);
    },
  );

  it('should derive the name from the handler when the manifest has no name', () => {
    const result = convert({
      logicFunctionManifest: buildLogicFunctionManifest({
        name: undefined,
        handlerName: 'myHandler',
      }),
      applicationSourceType: ApplicationRegistrationSourceType.LOCAL,
    });

    expect(result.name).toBe('myHandler');
  });
});
