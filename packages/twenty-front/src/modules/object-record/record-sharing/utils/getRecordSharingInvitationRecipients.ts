import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import {
  RecordSharePrincipalType,
  type RecordSharingFieldsFragment,
} from '~/generated-metadata/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const getRecordSharingInvitationRecipients = ({
  workspaceMembers,
  shares,
  roles,
  roleLabel,
}: {
  workspaceMembers: PartialWorkspaceMember[];
  shares: RecordSharingFieldsFragment['shares'];
  roles: RecordSharingFieldsFragment['roles'];
  roleLabel: string;
}): RecordSharingInvitationRecipient[] => {
  const hasExistingShare = ({
    principalId,
    principalType,
  }: {
    principalId: string;
    principalType: RecordSharePrincipalType;
  }) =>
    shares.some(
      (share) =>
        share.principalId === principalId &&
        share.principalType === principalType,
    );
  const memberRecipients = workspaceMembers
    .filter(
      (member) =>
        !hasExistingShare({
          principalId: member.id,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        }),
    )
    .map((member): RecordSharingInvitationRecipient => {
      const label = getWorkspaceMemberNameOrEmail(member);

      return {
        kind: 'workspaceMember',
        id: member.id,
        label,
        description: label === member.userEmail ? undefined : member.userEmail,
        avatarUrl: getAbsoluteImageUrl(member.avatarUrl),
      };
    });
  const roleRecipients = roles
    .filter(
      (role) =>
        !hasExistingShare({
          principalId: role.id,
          principalType: RecordSharePrincipalType.ROLE,
        }),
    )
    .map((role): RecordSharingInvitationRecipient => ({
      kind: 'role',
      id: role.id,
      label: role.label,
      description: roleLabel,
    }));

  return [...memberRecipients, ...roleRecipients];
};
