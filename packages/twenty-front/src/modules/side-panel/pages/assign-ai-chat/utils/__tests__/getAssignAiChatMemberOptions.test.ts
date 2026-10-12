import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getAssignAiChatMemberOptions } from '@/side-panel/pages/assign-ai-chat/utils/getAssignAiChatMemberOptions';

const buildMember = (
  id: string,
  firstName: string,
  lastName: string,
  userEmail: string,
): PartialWorkspaceMember => ({
  __typename: 'WorkspaceMember',
  id,
  name: { firstName, lastName },
  userEmail,
  userId: `user-${id}`,
});

const WORKSPACE_MEMBERS = [
  buildMember('phil', 'Phil', 'Schiler', 'phil@apple.dev'),
  buildMember('jane', 'Jane', 'Austen', 'jane@apple.dev'),
  buildMember('nameless', '', '', 'nameless@apple.dev'),
];

const listLabels = (search: string, currentWorkspaceMemberId = 'jane') =>
  getAssignAiChatMemberOptions({
    workspaceMembers: WORKSPACE_MEMBERS,
    currentWorkspaceMemberId,
    search,
  }).map(({ label }) => label);

describe('getAssignAiChatMemberOptions', () => {
  it('lists the current member first and labels members without a name by email', () => {
    expect(listLabels('')).toEqual([
      'Jane Austen',
      'Phil Schiler',
      'nameless@apple.dev',
    ]);
  });

  it('keeps the order when the current member is unknown', () => {
    expect(listLabels('', 'someone-else')).toEqual([
      'Phil Schiler',
      'Jane Austen',
      'nameless@apple.dev',
    ]);
  });

  it('matches names and emails regardless of case and surrounding spaces', () => {
    expect(listLabels('  SCHILER ')).toEqual(['Phil Schiler']);
    expect(listLabels('jane@')).toEqual(['Jane Austen']);
    expect(listLabels('nobody')).toEqual([]);
  });
});
