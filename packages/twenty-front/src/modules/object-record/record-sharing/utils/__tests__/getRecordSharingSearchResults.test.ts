import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { getRecordSharingSearchResults } from '@/object-record/record-sharing/utils/getRecordSharingSearchResults';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
  type RecordSharingFieldsFragment,
} from '~/generated-metadata/graphql';

const MEMBER: PartialWorkspaceMember = {
  id: 'member',
  userId: 'user',
  name: { firstName: 'Sarah', lastName: 'Lin' },
  userEmail: 'sarah@apple.dev',
};

const MEMBER_SHARE: RecordSharingFieldsFragment['shares'][number] = {
  id: 'member-share',
  principalId: MEMBER.id,
  principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel: RecordShareAccessLevel.READ,
  rowCause: RecordShareRowCause.MANUAL,
};

const SELECTED_RECIPIENT: RecordSharingInvitationRecipient = {
  kind: 'workspaceMember',
  id: MEMBER.id,
  label: 'Sarah Lin',
  description: 'sales-person@apple.dev',
};

const getSearchResults = (
  overrides: Partial<Parameters<typeof getRecordSharingSearchResults>[0]> = {},
) =>
  getRecordSharingSearchResults({
    search: '',
    sharing: { shares: [], roles: [] },
    workspaceMembers: [],
    currentWorkspaceMember: null,
    recipients: [],
    selectedRecipients: [],
    generalAccess: {
      hasGeneralAccess: true,
      label: 'Everyone at Apple',
      workspaceName: 'Apple',
    },
    ...overrides,
  });

describe('getRecordSharingSearchResults', () => {
  it('matches the current member email without confusing a role with the same ID', () => {
    const results = getSearchResults({
      search: '  SARAH@APPLE.DEV  ',
      workspaceMembers: [MEMBER],
      currentWorkspaceMember: { ...MEMBER, colorScheme: 'Light', locale: 'en' },
      sharing: {
        shares: [
          MEMBER_SHARE,
          {
            ...MEMBER_SHARE,
            id: 'role-share',
            principalType: RecordSharePrincipalType.ROLE,
          },
        ],
        roles: [{ id: MEMBER.id, label: 'Sales' }],
      },
    });

    expect(results.matchingShares).toEqual([MEMBER_SHARE]);
  });

  it('matches labels and email descriptions while excluding only the selected principal', () => {
    const roleRecipient: RecordSharingInvitationRecipient = {
      kind: 'role',
      id: MEMBER.id,
      label: 'Sales',
    };
    const otherMemberRecipient: RecordSharingInvitationRecipient = {
      kind: 'workspaceMember',
      id: 'other-member',
      label: 'Marco Rossi',
      description: 'sales@apple.dev',
    };
    const results = getSearchResults({
      search: '  SALES  ',
      recipients: [SELECTED_RECIPIENT, roleRecipient, otherMemberRecipient],
      selectedRecipients: [SELECTED_RECIPIENT],
    });

    expect(results.matchingRecipients).toEqual([
      roleRecipient,
      otherMemberRecipient,
    ]);
  });

  it('matches general access by workspace name while searching', () => {
    expect(getSearchResults({ search: '  APPLE  ' })).toEqual({
      matchingShares: [],
      matchingRecipients: [],
      matchesGeneralAccess: true,
      isInviting: true,
      hasSelection: false,
    });
  });

  it('keeps the invitation state active after selecting a recipient and clearing search', () => {
    const results = getSearchResults({
      selectedRecipients: [SELECTED_RECIPIENT],
    });

    expect(results.hasSelection).toBe(true);
    expect(results.isInviting).toBe(true);
    expect(results.matchesGeneralAccess).toBe(true);
  });

  it('keeps an empty search without selection in the normal sharing view', () => {
    const results = getSearchResults({ search: '   ' });

    expect(results.hasSelection).toBe(false);
    expect(results.isInviting).toBe(false);
    expect(results.matchesGeneralAccess).toBe(false);
  });
});
