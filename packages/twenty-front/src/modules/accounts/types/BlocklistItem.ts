export type BlocklistItem = {
  id: string;
  handle: string;
  workspaceMemberId: string;
  createdAt: string;
  context?: 'To' | 'Cc' | 'Bcc' | 'Any';
  __typename: 'BlocklistItem';
};
