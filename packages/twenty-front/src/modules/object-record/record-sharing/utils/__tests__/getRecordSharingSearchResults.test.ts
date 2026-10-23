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
      label: 'Everyone with access to Companies',
      workspaceName: 'Apple',
    },
    ...overrides,
  });

describe('getRecordSharingSearchResults', () => {
  it('keeps recipient order when an access update returns grants in a different order', () => {
    const otherMember: PartialWorkspaceMember = {
      ...MEMBER,
      id: 'other-member',
      name: { firstName: 'David', lastName: 'Phillips' },
    };
    const otherShare = {
      ...MEMBER_SHARE,
      id: 'other-share',
      principalId: otherMember.id,
    };
    const initialResults = getSearchResults({
      workspaceMembers: [MEMBER, otherMember],
      sharing: { shares: [MEMBER_SHARE, otherShare], roles: [] },
    });
    const updatedResults = getSearchResults({
      workspaceMembers: [MEMBER, otherMember],
      sharing: {
        shares: [
          otherShare,
          {
            ...MEMBER_SHARE,
            id: 'replacement-member-share',
            accessLevel: RecordShareAccessLevel.READ_WRITE,
          },
        ],
        roles: [],
      },
    });

    expect(
      updatedResults.matchingShares.map(({ share }) => share.principalId),
    ).toEqual(
      initialResults.matchingShares.map(({ share }) => share.principalId),
    );
  });

  it('lists the owner and current member before other recipients in alphabetical order', () => {
    const results = getSearchResults({
      currentWorkspaceMember: { ...MEMBER, colorScheme: 'Light', locale: 'en' },
      workspaceMembers: [
        MEMBER,
        {
          ...MEMBER,
          id: 'david',
          name: { firstName: 'David', lastName: 'Phillips' },
        },
        {
          ...MEMBER,
          id: 'alice',
          name: { firstName: 'Alice', lastName: 'Smith' },
        },
      ],
      sharing: {
        shares: [
          { ...MEMBER_SHARE, id: 'david-share', principalId: 'david' },
          MEMBER_SHARE,
          { ...MEMBER_SHARE, id: 'alice-share', principalId: 'alice' },
          {
            ...MEMBER_SHARE,
            id: 'owner-share',
            principalId: 'owner',
            rowCause: RecordShareRowCause.OWNER,
          },
        ],
        roles: [],
      },
    });

    expect(
      results.matchingShares.map(({ share }) => share.principalId),
    ).toEqual(['owner', MEMBER.id, 'alice', 'david']);
  });

  it('keeps recipients with identical names in a stable order', () => {
    const results = getSearchResults({
      workspaceMembers: [MEMBER, { ...MEMBER, id: 'other-member' }],
      sharing: {
        shares: [
          {
            ...MEMBER_SHARE,
            id: 'first-grant',
            principalId: 'other-member',
          },
          { ...MEMBER_SHARE, id: 'replacement-grant' },
        ],
        roles: [],
      },
    });

    expect(
      results.matchingShares.map(({ share }) => share.principalId),
    ).toEqual([MEMBER.id, 'other-member']);
  });

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

    expect(results.matchingShares).toEqual([
      { share: MEMBER_SHARE, label: 'You', member: MEMBER },
    ]);
  });

  it('matches the current member by full name even though their label is You', () => {
    const results = getSearchResults({
      search: 'sarah lin',
      workspaceMembers: [MEMBER],
      currentWorkspaceMember: { ...MEMBER, colorScheme: 'Light', locale: 'en' },
      sharing: { shares: [MEMBER_SHARE], roles: [] },
    });

    expect(results.matchingShares).toEqual([
      { share: MEMBER_SHARE, label: 'You', member: MEMBER },
    ]);
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
