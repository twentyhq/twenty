import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';

// API layers resolve object and field metadata from their own workspace cache
// snapshot, which can be a generation ahead of the ORM entity metadata loaded
// when entering the workspace context. Selecting a column from the newer
// snapshot then fails in the ORM, so the context is re-derived here to keep the
// columns a query selects and the entity metadata resolving them on the same
// generation.
export const alignQueryRunnerContextWithWorkspaceContext = (
  queryRunnerContext: CommonBaseQueryRunnerContext,
): CommonBaseQueryRunnerContext => {
  const {
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatIndexMaps,
    objectIdByNameSingular,
  } = getWorkspaceContext();

  const { universalIdentifier, nameSingular } =
    queryRunnerContext.flatObjectMetadata;

  const flatObjectMetadata =
    flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier];

  if (!isDefined(flatObjectMetadata)) {
    throw new CommonQueryRunnerException(
      `Object metadata not found for ${nameSingular} in the workspace context`,
      CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
      {
        userFriendlyMessage: msg`This object is being updated, please try again in a moment.`,
      },
    );
  }

  return {
    ...queryRunnerContext,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatIndexMaps,
    objectIdByNameSingular,
  };
};
