export type MessageFolder = {
  id: string;
  name: string;
  isSynced: boolean;
  isSentFolder: boolean;
  parentFolderId: string | null;
  externalId: string | null;
  messageChannelId: string;
  createdAt: string;
  updatedAt: string;
  __typename: 'MessageFolder';
};
