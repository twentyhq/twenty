export type MessageFolder = {
  id: string;
  name: string;
  syncCursor: string;
  isSentFolder: boolean;
  isSynced: boolean;
  messageChannelId: string;
  parentFolderId: string | null;
  externalId: string | null;
  __typename: 'MessageFolder';
};
