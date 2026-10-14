import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';

export const assertConnectionProviderLogicFunctionsAreOwn = ({
  manifest,
  fromAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
  inferDeletionFromMissingEntities,
}: {
  manifest: Pick<Manifest, 'connectionProviders'>;
  fromAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
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

      // fromAllFlatEntityMaps only holds this application's entities, which a partial sync keeps.
      const isOwnLogicFunction =
        isDefined(
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: toAllUniversalFlatEntityMaps.flatLogicFunctionMaps,
            universalIdentifier,
          }),
        ) ||
        (!inferDeletionFromMissingEntities &&
          isDefined(
            findFlatEntityByUniversalIdentifier({
              flatEntityMaps: fromAllFlatEntityMaps.flatLogicFunctionMaps,
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
