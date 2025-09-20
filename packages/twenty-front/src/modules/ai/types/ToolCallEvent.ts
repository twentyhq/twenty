export type ToolCallEvent = {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: {
    loadingMessage: string;
    input: unknown;
  };
};
