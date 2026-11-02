import {
  type AgentChatChannelAssignmentFilter,
  type AgentChatChannelThreadFilter,
  type AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

export type AgentChatChannelView = {
  channelId: string;
  channelStatus: AgentChatChannelThreadStatus;
  assignment: AgentChatChannelAssignmentFilter;
  filter: AgentChatChannelThreadFilter;
};
