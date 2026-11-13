import { type AgentChatChannelSummary as InboxChannelSummaryRow } from '~/generated-metadata/graphql';

export type AgentChatChannelSummary = Pick<
  InboxChannelSummaryRow,
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
