export type ToolCallEvent = {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: {
    loadingMessage: string;
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

export type ErrorEvent = {
  type: 'error';
  message: string;
  error?: unknown;
};

export type ParsedStep =
  | { type: 'tool'; events: ToolEvent[] }
  | { type: 'reasoning'; content: string; isThinking: boolean }
  | { type: 'text'; content: string }
  | { type: 'error'; message: string; error?: unknown };

export type AIChatAssistantMessageRendererProps = {
  streamData: string;
};
