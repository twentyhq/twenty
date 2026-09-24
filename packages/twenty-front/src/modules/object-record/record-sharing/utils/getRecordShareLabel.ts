import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { t } from '@lingui/core/macro';
import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type RecordSharingGrantDto,
  type RecordSharingRoleDto,
} from '~/generated-metadata/graphql';

export const getRecordShareLabel = ({
  share,
  member,
  role,
  currentWorkspaceMember,
}: {
  share: RecordSharingGrantDto;
  member: PartialWorkspaceMember | undefined;
  role: RecordSharingRoleDto | undefined;
  currentWorkspaceMember: CurrentWorkspaceMember | null;
}): string => {
  if (share.principalId === currentWorkspaceMember?.id) {
    return t`You`;
  }

  if (share.principalType === RecordSharePrincipalType.ROLE) {
    return role?.label ?? t`Deleted role`;
  }

  if (isDefined(member)) {
    return (
      `${member.name.firstName} ${member.name.lastName}`.trim() ||
      member.userEmail
    );
  }

  return t`Deleted member`;
};
