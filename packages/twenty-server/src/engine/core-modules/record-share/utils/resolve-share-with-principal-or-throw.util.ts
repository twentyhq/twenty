/* @license Enterprise */

import { msg } from '@lingui/core/macro';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { GENERAL_RECORD_SHARE_ACCESS_LEVELS } from 'src/engine/core-modules/record-share/constants/general-record-share-access-levels.constant';
import { GRANTABLE_RECORD_SHARE_ACCESS_LEVELS } from 'src/engine/core-modules/record-share/constants/grantable-record-share-access-levels.constant';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/core-modules/record-share/record-share.exception';
import { type RecordShareInput } from 'src/engine/core-modules/record-share/types/record-share-input.type';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';

const buildSingleTargetException = () =>
  new RecordShareException(
    'Each shareWith entry must target exactly one of workspaceMemberId, roleId or everyone',
    RecordShareExceptionCode.INVALID_SHARE_WITH,
    {
      userFriendlyMessage: msg`Each shareWith entry must target exactly one of workspaceMemberId, roleId or everyone`,
    },
  );

export const resolveShareWithPrincipalOrThrow = (
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
    shareWithEntry.everyone
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

  if (!isDefined(principal)) {
    throw buildSingleTargetException();
  }

  if (
    principal.principalType !== RecordSharePrincipalType.EVERYONE &&
    !isValidUuid(principal.principalId)
  ) {
    throw new RecordShareException(
      `shareWith principal "${principal.principalId}" is not a valid UUID`,
      RecordShareExceptionCode.INVALID_SHARE_WITH,
      { userFriendlyMessage: msg`Invalid UUID format.` },
    );
  }

  // Everyone holds the general access of the record; named principals are
  // granted access, so NONE means nothing for them
  const allowedAccessLevels =
    principal.principalType === RecordSharePrincipalType.EVERYONE
      ? GENERAL_RECORD_SHARE_ACCESS_LEVELS
      : GRANTABLE_RECORD_SHARE_ACCESS_LEVELS;

  if (!allowedAccessLevels.includes(shareWithEntry.accessLevel)) {
    throw new RecordShareException(
      `shareWith access level "${shareWithEntry.accessLevel}" must be one of ${allowedAccessLevels.join(', ')}`,
      RecordShareExceptionCode.INVALID_SHARE_WITH,
      { userFriendlyMessage: msg`Invalid access level.` },
    );
  }

  return { ...principal, accessLevel: shareWithEntry.accessLevel };
};
