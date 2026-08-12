import { type SlackRecordNode } from 'src/logic-functions/types/slack-record-node.type';

export type SlackRecordCardDefinition = {
  objectNamePlural: string;
  objectLabel: string;
  nodeSelection: Record<string, unknown>;
  // Used when the full selection is rejected, which happens when a workspace
  // has disabled one of the detail fields.
  nameOnlyNodeSelection: Record<string, unknown>;
  getRecordName: (node: SlackRecordNode) => string | undefined;
  getDetails: (node: SlackRecordNode) => string[];
};
