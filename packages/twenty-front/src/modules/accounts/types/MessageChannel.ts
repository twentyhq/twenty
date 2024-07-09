import { MessageChannelVisibility } from '~/generated/graphql';

export enum MessageChannelContactAutoCreationPolicy {
  SENT_AND_RECEIVED = 'SENT_AND_RECEIVED',
  SENT = 'SENT',
  NONE = 'NONE',
}

export type MessageChannel = {
  id: string;
  handle: string;
  contactAutoCreationPolicy?: MessageChannelContactAutoCreationPolicy;
  excludeNonProfessionalEmails: boolean;
  excludeGroupEmails: boolean;
  isSyncEnabled: boolean;
  visibility: MessageChannelVisibility;
  syncStatus: string;
  __typename: 'MessageChannel';
};
