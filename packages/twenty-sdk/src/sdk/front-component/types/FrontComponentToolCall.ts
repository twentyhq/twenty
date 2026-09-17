// Mirrors the tool part states the chat runtime emits, approval states
// included, so a widget can render a call at any point in its life.
export type FrontComponentToolCallStatus =
  | 'input-streaming'
  | 'input-available'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-available'
  | 'output-denied'
  | 'output-error';

export type FrontComponentToolCall = {
  toolCallId: string;
  toolName: string;
  status: FrontComponentToolCallStatus;
  // What the agent proposed. Absent while the model is still streaming it.
  input?: Record<string, unknown>;
  // What the tool returned. Absent until the call has run.
  output?: Record<string, unknown>;
  errorText?: string;
};
