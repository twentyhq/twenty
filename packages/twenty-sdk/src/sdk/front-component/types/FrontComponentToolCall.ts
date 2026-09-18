import { type FrontComponentToolCallStatus } from './FrontComponentToolCallStatus';

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
