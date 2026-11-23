import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getAddAiChatParticipantsMemberOptions } from '@/side-panel/pages/ai-chat-participants/utils/getAddAiChatParticipantsMemberOptions';

const buildMember = (
  id: string,
  firstName: string,
  lastName: string,
): PartialWorkspaceMember => ({
  __typename: 'WorkspaceMember',
  id,
  name: { firstName, lastName },
  userEmail: `${id}@apple.dev`,
  userId: `user-${id}`,
});

const WORKSPACE_MEMBERS = [
  buildMember('phil', 'Phil', 'Schiler'),
  buildMember('jane', 'Jane', 'Austen'),
  buildMember('tim', 'Tim', 'Cook'),
];

const listLabels = ({
  participantWorkspaceMemberIds = [],
  search = '',
}: {
  participantWorkspaceMemberIds?: string[];
  search?: string;
}) =>
  getAddAiChatParticipantsMemberOptions({
    workspaceMembers: WORKSPACE_MEMBERS,
    currentWorkspaceMemberId: 'jane',
    participantWorkspaceMemberIds,
    search,
  }).map(({ label }) => label);

describe('getAddAiChatParticipantsMemberOptions', () => {
  it('leaves out the current member', () => {
    expect(listLabels({})).toEqual(['Phil Schiler', 'Tim Cook']);
  });

  it('leaves out members already in the chat', () => {
    expect(listLabels({ participantWorkspaceMemberIds: ['tim'] })).toEqual([
      'Phil Schiler',
    ]);
  });

  it('narrows the members to the search', () => {
    expect(listLabels({ search: 'cook' })).toEqual(['Tim Cook']);
  });
});
