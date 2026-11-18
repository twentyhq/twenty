import { type AgentChatChannel as InboxChannelRow } from '~/generated-metadata/graphql';

export type AiChatChannel = Omit<InboxChannelRow, 'isCustom'>;
