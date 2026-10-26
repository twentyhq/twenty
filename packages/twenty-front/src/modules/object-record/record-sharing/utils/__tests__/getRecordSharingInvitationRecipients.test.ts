import { getRecordSharingInvitationRecipients } from '@/object-record/record-sharing/utils/getRecordSharingInvitationRecipients';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from '~/generated-metadata/graphql';

const MEMBER: PartialWorkspaceMember = {
  id: 'member',
  userId: 'user',
  name: { firstName: 'Sarah', lastName: 'Lin' },
  userEmail: 'sarah@apple.dev',
};

describe('getRecordSharingInvitationRecipients', () => {
  it('excludes existing grants by principal type when role and member IDs overlap', () => {
    const recipients = getRecordSharingInvitationRecipients({
      workspaceMembers: [MEMBER, { ...MEMBER, id: 'role' }],
      shares: [
        {
          id: 'member-share',
          principalId: MEMBER.id,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.READ,
          rowCause: RecordShareRowCause.MANUAL,
        },
        {
          id: 'role-share',
          principalId: 'role',
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel: RecordShareAccessLevel.READ,
          rowCause: RecordShareRowCause.MANUAL,
        },
      ],
      roles: [
        { id: MEMBER.id, label: 'Sales' },
        { id: 'role', label: 'Support' },
      ],
      roleLabel: 'Role',
    });

    expect(recipients).toEqual([
      expect.objectContaining({ kind: 'workspaceMember', id: 'role' }),
      { kind: 'role', id: MEMBER.id, label: 'Sales', description: 'Role' },
    ]);
  });

  it('shows the email once and keeps the avatar when a member has no display name', () => {
    expect(
      getRecordSharingInvitationRecipients({
        workspaceMembers: [
          {
            ...MEMBER,
            name: { firstName: '', lastName: '' },
            avatarUrl: 'https://example.com/avatar.png',
          },
        ],
        shares: [],
        roles: [],
        roleLabel: 'Role',
      }),
    ).toEqual([
      {
        kind: 'workspaceMember',
        id: MEMBER.id,
        label: MEMBER.userEmail,
        description: undefined,
        avatarUrl: 'https://example.com/avatar.png',
      },
    ]);
  });
});
