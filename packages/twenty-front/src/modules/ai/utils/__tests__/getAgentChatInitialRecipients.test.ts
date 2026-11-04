import { getAgentChatInitialRecipients } from '@/ai/utils/getAgentChatInitialRecipients';

const workspaceMembers = [
  {
    id: 'jane',
    name: { firstName: 'Jane', lastName: 'Austen' },
    userEmail: 'jane@example.com',
  },
  {
    id: 'bob',
    name: { firstName: 'Bob', lastName: 'Smith' },
    userEmail: 'bob@example.com',
  },
];

describe('getAgentChatInitialRecipients', () => {
  it('resolves selected members once without inventing missing recipients', () => {
    expect(
      getAgentChatInitialRecipients({
        recipientWorkspaceMemberIds: ['jane', 'missing', 'jane'],
        workspaceMembers,
      }),
    ).toEqual([{ workspaceMemberId: 'jane', label: 'Jane Austen' }]);
  });
});
