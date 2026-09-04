import { msg } from '@lingui/core/macro';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type ShareWithInput } from 'src/engine/api/common/types/share-with-input.type';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { type RecordShareInput } from 'src/engine/record-share/types/record-share-input.type';

const buildSingleTargetException = () =>
  new CommonQueryRunnerException(
    'Each shareWith entry must target exactly one of workspaceMemberId, roleId or everyone',
    CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
    {
      userFriendlyMessage: msg`Each shareWith entry must target exactly one of workspaceMemberId, roleId or everyone`,
    },
  );

export const resolveShareWithPrincipal = (
  shareWithEntry: ShareWithInput | null,
): Pick<RecordShareInput, 'principalId' | 'principalType' | 'accessLevel'> => {
  if (!isDefined(shareWithEntry)) {
    throw buildSingleTargetException();
  }

  const principals = [
    isDefined(shareWithEntry.workspaceMemberId)
      ? {
          principalId: shareWithEntry.workspaceMemberId,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        }
      : undefined,
    isDefined(shareWithEntry.roleId)
      ? {
          principalId: shareWithEntry.roleId,
          principalType: RecordSharePrincipalType.ROLE,
        }
      : undefined,
    shareWithEntry.everyone === true
      ? {
          principalId: EVERYONE_PRINCIPAL_ID,
          principalType: RecordSharePrincipalType.EVERYONE,
        }
      : undefined,
  ].filter(isDefined);

  if (principals.length !== 1) {
    throw buildSingleTargetException();
  }

  const [principal] = principals;

  if (principal.principalType !== RecordSharePrincipalType.EVERYONE) {
    assertIsValidUuid(principal.principalId);
  }

  return { ...principal, accessLevel: shareWithEntry.accessLevel };
};
