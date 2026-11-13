import { getInboxInitialRecipients } from '@/ai/utils/getInboxInitialRecipients';

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

describe('getInboxInitialRecipients', () => {
  it('resolves selected members once without inventing missing recipients', () => {
    expect(
      getInboxInitialRecipients({
        recipientWorkspaceMemberIds: ['jane', 'missing', 'jane'],
        workspaceMembers,
      }),
    ).toEqual([{ workspaceMemberId: 'jane', label: 'Jane Austen' }]);
  });
});
