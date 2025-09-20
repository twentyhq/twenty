export type ToolResultEvent = {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: {
    success: boolean;
    result?: unknown;
    error?: string;
    message: string;
  };
  message: string;
};
