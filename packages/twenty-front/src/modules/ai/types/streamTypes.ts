export type ToolCallEvent = {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: {
    loadingMessage: string;
    completionMessage: string;
  };
};

export type ToolResultEvent = {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: unknown;
  message: string;
};

export type ToolEvent = ToolCallEvent | ToolResultEvent;

export type ParsedStep =
  | { type: 'tool'; events: ToolEvent[] }
  | { type: 'reasoning'; content: string; isThinking: boolean }
  | { type: 'text'; content: string };

export type AIChatMessageStreamRendererProps = {
  streamData: string;
};
