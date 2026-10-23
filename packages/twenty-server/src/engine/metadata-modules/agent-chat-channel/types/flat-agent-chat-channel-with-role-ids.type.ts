import { type FlatAgentChatChannel } from 'src/engine/metadata-modules/flat-agent-chat-channel/types/flat-agent-chat-channel.type';

export type FlatAgentChatChannelWithRoleIds = FlatAgentChatChannel & {
  roleIds: string[];
};
