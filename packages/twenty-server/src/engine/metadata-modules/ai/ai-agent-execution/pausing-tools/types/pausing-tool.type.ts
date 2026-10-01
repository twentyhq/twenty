import { type PausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-call.type';

// type-erased so tools with different inputs can share one map
export type PausingTool = {
  isAwaitingOutput: (toolOutput: unknown) => boolean;
  parseCall: (toolInput: unknown) => PausingToolCall | null;
};
