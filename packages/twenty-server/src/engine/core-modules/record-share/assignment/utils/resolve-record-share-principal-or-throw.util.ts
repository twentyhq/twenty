/* @license Enterprise */

import { msg } from '@lingui/core/macro';
import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/core-modules/record-share/record-share.exception';
import { type RecordShareInput } from 'src/engine/core-modules/record-share/types/record-share-input.type';

export const resolveRecordSharePrincipalOrThrow = ({
  workspaceMemberId,
  roleId,
}: {
  workspaceMemberId?: string | null;
  roleId?: string | null;
}): Pick<RecordShareInput, 'principalId' | 'principalType'> => {
  const principals = [
    isDefined(workspaceMemberId)
      ? {
          principalId: workspaceMemberId,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        }
      : undefined,
    isDefined(roleId)
      ? { principalId: roleId, principalType: RecordSharePrincipalType.ROLE }
      : undefined,
  ].filter(isDefined);

  if (principals.length !== 1) {
    throw new RecordShareException(
      'A record share principal must name exactly one of workspaceMemberId or roleId',
      RecordShareExceptionCode.INVALID_SHARE_WITH,
      {
        userFriendlyMessage: msg`Choose one person or one role to share with.`,
      },
    );
  }

  const [principal] = principals;

  if (!isValidUuid(principal.principalId)) {
    throw new RecordShareException(
      `Record share principal "${principal.principalId}" is not a valid UUID`,
      RecordShareExceptionCode.INVALID_SHARE_WITH,
      { userFriendlyMessage: msg`Invalid UUID format.` },
    );
  }

  return principal;
};
