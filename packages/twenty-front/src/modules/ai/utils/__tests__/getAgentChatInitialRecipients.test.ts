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
  it('does not apply initial recipients to other sends', () => {
    expect(
      getAgentChatInitialRecipients({
        shouldIncludeInitialRecipients: false,
        recipientWorkspaceMemberIds: ['jane'],
        workspaceMembers,
      }),
    ).toEqual([]);
  });

  it('resolves selected members once without inventing missing recipients', () => {
    expect(
      getAgentChatInitialRecipients({
        shouldIncludeInitialRecipients: true,
        recipientWorkspaceMemberIds: ['jane', 'missing', 'jane'],
        workspaceMembers,
      }),
    ).toEqual([{ workspaceMemberId: 'jane', label: 'Jane Austen' }]);
  });
});
