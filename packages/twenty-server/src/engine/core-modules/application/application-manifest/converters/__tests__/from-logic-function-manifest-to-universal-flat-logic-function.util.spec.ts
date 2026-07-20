import { type LogicFunctionManifest } from 'twenty-shared/application';

import { fromLogicFunctionManifestToUniversalFlatLogicFunction } from 'src/engine/core-modules/application/application-manifest/converters/from-logic-function-manifest-to-universal-flat-logic-function.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

describe('fromLogicFunctionManifestToUniversalFlatLogicFunction', () => {
  const now = '2026-01-01T00:00:00.000Z';
  const applicationUniversalIdentifier = 'app-uuid-1';

  const buildLogicFunctionManifest = (
    overrides: Partial<LogicFunctionManifest> = {},
  ): LogicFunctionManifest => ({
    universalIdentifier: 'fn-uuid-1',
    name: 'My Function',
    handlerName: 'handler',
    sourceHandlerPath: 'src/my-function.ts',
    builtHandlerPath: 'dist/my-function.mjs',
    builtHandlerChecksum: 'checksum-1',
    ...overrides,
  });

  it.each([
    ApplicationRegistrationSourceType.TARBALL,
    ApplicationRegistrationSourceType.NPM,
  ])('should set PREBUILT execution mode for %s source', (sourceType) => {
    const result = fromLogicFunctionManifestToUniversalFlatLogicFunction({
      logicFunctionManifest: buildLogicFunctionManifest(),
      applicationUniversalIdentifier,
      applicationSourceType: sourceType,
      now,
    });

    expect(result.executionMode).toBe(LogicFunctionExecutionMode.PREBUILT);
    expect(result.checksum).toBe('checksum-1');
    expect(result.isBuildUpToDate).toBe(true);
  });

  it.each([
    ApplicationRegistrationSourceType.LOCAL,
    ApplicationRegistrationSourceType.OAUTH_ONLY,
  ])('should keep LIVE execution mode for %s source', (sourceType) => {
    const result = fromLogicFunctionManifestToUniversalFlatLogicFunction({
      logicFunctionManifest: buildLogicFunctionManifest(),
      applicationUniversalIdentifier,
      applicationSourceType: sourceType,
      now,
    });

    expect(result.executionMode).toBe(LogicFunctionExecutionMode.LIVE);
  });

  it('should fall back to LIVE for a packaged source without a checksum', () => {
    const result = fromLogicFunctionManifestToUniversalFlatLogicFunction({
      logicFunctionManifest: buildLogicFunctionManifest({
        builtHandlerChecksum: '',
      }),
      applicationUniversalIdentifier,
      applicationSourceType: ApplicationRegistrationSourceType.NPM,
      now,
    });

    expect(result.executionMode).toBe(LogicFunctionExecutionMode.LIVE);
  });

  it('should derive the name from the handler when the manifest has no name', () => {
    const result = fromLogicFunctionManifestToUniversalFlatLogicFunction({
      logicFunctionManifest: buildLogicFunctionManifest({
        name: undefined,
        handlerName: 'myHandler',
      }),
      applicationUniversalIdentifier,
      applicationSourceType: ApplicationRegistrationSourceType.LOCAL,
      now,
    });

    expect(result.name).toBe('myHandler');
  });
});
