import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

export const assertConnectionProviderLogicFunctionsAreOwn = ({
  manifest,
  fromFlatLogicFunctionMaps,
  toFlatLogicFunctionMaps,
  inferDeletionFromMissingEntities,
}: {
  manifest: Pick<Manifest, 'connectionProviders'>;
  fromFlatLogicFunctionMaps: UniversalFlatEntityMaps<SyncableFlatEntity>;
  toFlatLogicFunctionMaps: UniversalFlatEntityMaps<SyncableFlatEntity>;
  inferDeletionFromMissingEntities: boolean;
}): void => {
  for (const connectionProvider of manifest.connectionProviders ?? []) {
    for (const [hook, logicFunctionReference] of Object.entries({
      identifyAccount: connectionProvider.identifyAccountLogicFunction,
      onConnect: connectionProvider.onConnectLogicFunction,
      onDisconnect: connectionProvider.onDisconnectLogicFunction,
    })) {
      if (!isDefined(logicFunctionReference)) {
        continue;
      }

      const { universalIdentifier } = logicFunctionReference;

      // fromFlatLogicFunctionMaps only holds this application's functions, which a partial sync keeps.
      const isOwnLogicFunction =
        isDefined(
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: toFlatLogicFunctionMaps,
            universalIdentifier,
          }),
        ) ||
        (!inferDeletionFromMissingEntities &&
          isDefined(
            findFlatEntityByUniversalIdentifier({
              flatEntityMaps: fromFlatLogicFunctionMaps,
              universalIdentifier,
            }),
          ));

      if (!isOwnLogicFunction) {
        throw new ApplicationException(
          `Failed to resolve ${hook} logic function of connection provider ${connectionProvider.name} for universalIdentifier ${universalIdentifier}`,
          ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
        );
      }
    }
  }
};
