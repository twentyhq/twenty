import { type LogicFunctionManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { assertLogicFunctionFailureHandlersAreOwn } from 'src/engine/core-modules/application/application-manifest/utils/assert-logic-function-failure-handlers-are-own.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

const FAILING_LOGIC_FUNCTION_IDENTIFIER = 'failing-logic-function';
const MANIFEST_LOGIC_FUNCTION_IDENTIFIER = 'manifest-logic-function';
const EXISTING_LOGIC_FUNCTION_IDENTIFIER = 'existing-logic-function';

const buildFlatLogicFunctionMaps = (
  universalIdentifiers: string[],
): UniversalFlatEntityMaps<SyncableFlatEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    universalIdentifiers.map((universalIdentifier) => [
      universalIdentifier,
      {
        id: `${universalIdentifier}-id`,
        universalIdentifier,
        applicationId: 'application-id',
        workspaceId: 'workspace-id',
      },
    ]),
  ),
});

const buildLogicFunction = (
  onFailureUniversalIdentifier?: string,
): LogicFunctionManifest => ({
  universalIdentifier: FAILING_LOGIC_FUNCTION_IDENTIFIER,
  sourceHandlerPath: 'src/answer.ts',
  builtHandlerPath: 'dist/answer.mjs',
  builtHandlerChecksum: 'checksum',
  handlerName: 'handler',
  ...(isDefined(onFailureUniversalIdentifier)
    ? {
        onFailureLogicFunction: {
          universalIdentifier: onFailureUniversalIdentifier,
        },
      }
    : {}),
});

const assertFailureHandler = ({
  onFailureUniversalIdentifier,
  inferDeletionFromMissingEntities,
}: {
  onFailureUniversalIdentifier?: string;
  inferDeletionFromMissingEntities: boolean;
}) =>
  assertLogicFunctionFailureHandlersAreOwn({
    manifest: {
      logicFunctions: [buildLogicFunction(onFailureUniversalIdentifier)],
    },
    fromFlatLogicFunctionMaps: buildFlatLogicFunctionMaps([
      EXISTING_LOGIC_FUNCTION_IDENTIFIER,
    ]),
    toFlatLogicFunctionMaps: buildFlatLogicFunctionMaps([
      FAILING_LOGIC_FUNCTION_IDENTIFIER,
      MANIFEST_LOGIC_FUNCTION_IDENTIFIER,
    ]),
    inferDeletionFromMissingEntities,
  });

describe('assertLogicFunctionFailureHandlersAreOwn', () => {
  it('accepts a failure handler declared in the manifest', () => {
    expect(() =>
      assertFailureHandler({
        onFailureUniversalIdentifier: MANIFEST_LOGIC_FUNCTION_IDENTIFIER,
        inferDeletionFromMissingEntities: true,
      }),
    ).not.toThrow();
  });

  it('accepts an existing logic function of the application on a partial sync', () => {
    expect(() =>
      assertFailureHandler({
        onFailureUniversalIdentifier: EXISTING_LOGIC_FUNCTION_IDENTIFIER,
        inferDeletionFromMissingEntities: false,
      }),
    ).not.toThrow();
  });

  it('rejects an existing logic function on a full sync that no longer declares it', () => {
    expect(() =>
      assertFailureHandler({
        onFailureUniversalIdentifier: EXISTING_LOGIC_FUNCTION_IDENTIFIER,
        inferDeletionFromMissingEntities: true,
      }),
    ).toThrow(ApplicationException);
  });
});
