import { type ToolSet } from 'ai';

import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';

// Parallel to ToolProvider, not a variant of it. A binder produces SDK-native
// tool objects (Anthropic webSearch, OpenAI webSearch, etc.) that the AI SDK
// passes straight to the model. These tools are opaque — they can't be
// serialized into descriptors, don't appear in the tool catalog, and aren't
// executed by ToolExecutorService. They're merged directly into the ToolSet
// handed to streamText.
export interface NativeToolBinder {
  bind(model: RegisteredAiModel, options: NativeModelToolOptions): ToolSet;
}
