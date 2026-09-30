import { type PausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-call.type';

// A definition with its input and output types bound per call, so tools with
// different inputs can share one map keyed by tool name.
export type PausingTool = {
  isAwaitingOutput: (toolOutput: unknown) => boolean;
  parseCall: (toolInput: unknown) => PausingToolCall | null;
};
