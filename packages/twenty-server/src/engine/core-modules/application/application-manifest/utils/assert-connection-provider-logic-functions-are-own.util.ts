import { type Manifest } from 'twenty-shared/application';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { getConnectionProviderManifestLogicFunctionReferences } from 'src/engine/core-modules/application/application-manifest/utils/get-connection-provider-manifest-logic-function-references.util';
import { isOwnManifestLogicFunction } from 'src/engine/core-modules/application/application-manifest/utils/is-own-manifest-logic-function.util';
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
    for (const {
      hook,
      universalIdentifier,
    } of getConnectionProviderManifestLogicFunctionReferences(
      connectionProvider,
    )) {
      const isOwnLogicFunction = isOwnManifestLogicFunction({
        universalIdentifier,
        fromFlatLogicFunctionMaps,
        toFlatLogicFunctionMaps,
        inferDeletionFromMissingEntities,
      });

      if (!isOwnLogicFunction) {
        throw new ApplicationException(
          `Failed to resolve ${hook} logic function of connection provider ${connectionProvider.name} for universalIdentifier ${universalIdentifier}`,
          ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
        );
      }
    }
  }
};
