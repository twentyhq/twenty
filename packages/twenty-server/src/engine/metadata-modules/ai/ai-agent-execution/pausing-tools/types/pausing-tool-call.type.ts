import { type PausingToolAsk } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-ask.type';

export type PausingToolResolution =
  | {
      isValid: true;
      output: Record<string, unknown>;
      toolResult: Record<string, unknown>;
      answerText: string;
    }
  | { isValid: false; errorMessage: string };

export type PausingToolCall = {
  buildAsk: () => PausingToolAsk;
  resolve: (output: unknown) => PausingToolResolution;
  toSkippedToolResult: () => Record<string, unknown>;
};
