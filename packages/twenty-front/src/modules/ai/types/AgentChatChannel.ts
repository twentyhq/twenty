import { type AgentChatChannel as InboxChannelRow } from '~/generated-metadata/graphql';

export type AgentChatChannel = Omit<InboxChannelRow, 'isCustom'>;
