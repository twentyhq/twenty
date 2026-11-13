import { type AgentChatChannel as InboxChannelRow } from '~/generated-metadata/graphql';

export type InboxChannel = Omit<InboxChannelRow, 'isCustom'>;
