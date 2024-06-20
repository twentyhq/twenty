import { MessageChannelVisibility } from '~/generated/graphql';

export type MessageChannel = {
  id: string;
  handle: string;
  isContactAutoCreationEnabled?: boolean;
  isSyncEnabled: boolean;
  visibility: MessageChannelVisibility;
  syncStatus: string;
  __typename: 'MessageChannel';
};
