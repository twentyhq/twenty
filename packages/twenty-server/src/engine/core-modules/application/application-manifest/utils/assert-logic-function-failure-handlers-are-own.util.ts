import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { isOwnManifestLogicFunction } from 'src/engine/core-modules/application/application-manifest/utils/is-own-manifest-logic-function.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

export const assertLogicFunctionFailureHandlersAreOwn = ({
  manifest,
  fromFlatLogicFunctionMaps,
  toFlatLogicFunctionMaps,
  inferDeletionFromMissingEntities,
}: {
  manifest: Pick<Manifest, 'logicFunctions'>;
  fromFlatLogicFunctionMaps: UniversalFlatEntityMaps<SyncableFlatEntity>;
  toFlatLogicFunctionMaps: UniversalFlatEntityMaps<SyncableFlatEntity>;
  inferDeletionFromMissingEntities: boolean;
}): void => {
  for (const logicFunction of manifest.logicFunctions) {
    const failureHandlerUniversalIdentifier =
      logicFunction.onFailureLogicFunction?.universalIdentifier;

    if (!isDefined(failureHandlerUniversalIdentifier)) {
      continue;
    }

    if (
      failureHandlerUniversalIdentifier === logicFunction.universalIdentifier
    ) {
      throw new ApplicationException(
        `Logic function ${logicFunction.universalIdentifier} cannot be its own onFailureLogicFunction`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    if (
      !isOwnManifestLogicFunction({
        universalIdentifier: failureHandlerUniversalIdentifier,
        fromFlatLogicFunctionMaps,
        toFlatLogicFunctionMaps,
        inferDeletionFromMissingEntities,
      })
    ) {
      throw new ApplicationException(
        `Failed to resolve onFailureLogicFunction of logic function ${logicFunction.universalIdentifier} for universalIdentifier ${failureHandlerUniversalIdentifier}`,
        ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }
  }
};
