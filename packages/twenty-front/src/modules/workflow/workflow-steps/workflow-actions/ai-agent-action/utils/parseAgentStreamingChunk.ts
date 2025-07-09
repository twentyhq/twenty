export type AgentStreamingEvent = {
  type: 'text-delta' | 'tool-call';
  message: string;
};

export type AgentStreamingParserCallbacks = {
  onTextDelta?: (message: string) => void;
  onToolCall?: (message: string) => void;
  onError?: (error: Error, rawLine: string) => void;
};

export const parseAgentStreamingChunk = (
  chunk: string,
  callbacks: AgentStreamingParserCallbacks,
): void => {
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const event = JSON.parse(line.slice(6)) as AgentStreamingEvent;

        switch (event.type) {
          case 'text-delta':
            callbacks.onTextDelta?.(event.message);
            break;
          case 'tool-call':
            callbacks.onToolCall?.(event.message);
            break;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error : new Error('Unknown parsing error');
        callbacks.onError?.(errorMessage, line);
      }
    }
  }
};
