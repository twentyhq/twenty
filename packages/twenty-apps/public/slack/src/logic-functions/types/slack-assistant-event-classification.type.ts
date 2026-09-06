export type SlackAssistantEventKind =
  | 'mention'
  | 'directMessage'
  | 'threadFollowUp';

export type SlackAssistantEventClassification =
  | { kind: SlackAssistantEventKind }
  | { kind: null; skipReason: string };
