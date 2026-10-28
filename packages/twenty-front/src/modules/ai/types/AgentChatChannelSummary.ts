import { type AgentChatChannelSummary as AgentChatChannelSummaryRow } from '~/generated-metadata/graphql';

export type AgentChatChannelSummary = Pick<
  AgentChatChannelSummaryRow,
  | 'openCount'
  | 'hasUnreadOpen'
  | 'assignedToMeCount'
  | 'hasUnreadAssignedToMe'
  | 'snoozedCount'
  | 'doneCount'
>;
