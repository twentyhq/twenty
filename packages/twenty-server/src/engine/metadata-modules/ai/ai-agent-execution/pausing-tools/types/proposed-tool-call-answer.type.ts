// The member's decision on a proposed call, read from its tool output once it ran or was refused
export type ProposedToolCallAnswer = {
  outcome: 'executed' | 'rejected' | 'failed' | 'conflict';
  // the member may approve an alternative, such as saving an email as a draft instead of sending it
  toolName: string;
  arguments: Record<string, unknown>;
  // a conflict carries the record's latest values
  output: unknown;
  feedback: string | null;
  error: string | null;
};
