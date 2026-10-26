import {
  type AgentChatChannelAssignmentFilter,
  type AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

export type AgentChatChannelView = {
  channelId: string;
  channelStatus: AgentChatChannelThreadStatus;
  assignment: AgentChatChannelAssignmentFilter;
};
