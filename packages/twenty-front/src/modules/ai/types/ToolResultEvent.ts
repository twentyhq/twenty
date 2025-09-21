export type ToolResultEvent = {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  output: {
    success: boolean;
    result?: unknown;
    error?: string;
    message: string;
  };
  message: string;
};
