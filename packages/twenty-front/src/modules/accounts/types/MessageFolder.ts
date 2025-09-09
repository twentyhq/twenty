export type MessageFolder = {
  id: string;
  name: string;
  syncCursor: string;
  isSentFolder: boolean;
  isSynced: boolean;
  messageChannelId: string;
  __typename: 'MessageFolder';
};
