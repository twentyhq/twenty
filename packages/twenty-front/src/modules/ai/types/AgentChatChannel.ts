import { type AgentChatChannel as AgentChatChannelRow } from '~/generated-metadata/graphql';

export type AgentChatChannel = Omit<AgentChatChannelRow, 'isCustom'>;
