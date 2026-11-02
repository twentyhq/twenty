import { type AgentChatChannelSummary as AgentChatChannelSummaryRow } from '~/generated-metadata/graphql';

export type AgentChatChannelSummary = Pick<
  AgentChatChannelSummaryRow,
  | 'openCount'
  | 'needsInputCount'
  | 'mentionedCount'
  | 'hasUnreadOpen'
  | 'assignedToMeCount'
  | 'assignedCount'
  | 'unassignedCount'
  | 'snoozedCount'
  | 'doneCount'
>;
