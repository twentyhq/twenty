import { type SlackRecordNode } from 'src/logic-functions/types/slack-record-node.type';

export type SlackRecordCardDefinition = {
  objectNamePlural: string;
  objectLabel: string;
  nodeSelection: Record<string, unknown>;
  getRecordName: (node: SlackRecordNode) => string | undefined;
  getDetails: (node: SlackRecordNode) => string[];
};
