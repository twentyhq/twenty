import { msg } from '@lingui/core/macro';
import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { resolveShareWithPrincipal } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/resolve-share-with-principal.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type ShareWithInput } from 'src/engine/api/common/types/share-with-input.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';

export const validateShareWithPrincipalsOrThrow = ({
  shareWith,
  flatWorkspaceMemberMaps,
  flatRoleMaps,
}: {
  shareWith: ShareWithInput[];
  flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
  flatRoleMaps: FlatRoleMaps;
}): void => {
  for (const shareWithEntry of shareWith) {
    const { principalId, principalType } =
      resolveShareWithPrincipal(shareWithEntry);

    if (
      principalType === RecordSharePrincipalType.WORKSPACE_MEMBER &&
      !isDefined(flatWorkspaceMemberMaps.byId[principalId])
    ) {
      throw new CommonQueryRunnerException(
        `shareWith names a workspace member that does not belong to this workspace: ${principalId}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`shareWith names a workspace member that does not belong to this workspace`,
        },
      );
    }

    if (
      principalType === RecordSharePrincipalType.ROLE &&
      !isDefined(flatRoleMaps.universalIdentifierById[principalId])
    ) {
      throw new CommonQueryRunnerException(
        `shareWith names a role that does not belong to this workspace: ${principalId}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`shareWith names a role that does not belong to this workspace`,
        },
      );
    }
  }
};
