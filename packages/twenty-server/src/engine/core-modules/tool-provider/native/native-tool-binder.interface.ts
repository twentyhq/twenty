import { type ToolSet } from 'ai';
import { type ToolCategory } from 'twenty-shared/ai';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

// Parallel to ToolProvider, not a variant of it. A binder produces SDK-native
// tool objects (Anthropic webSearch, OpenAI webSearch, etc.) that the AI SDK
// passes straight to the model. These tools are opaque — they can't be
// serialized into descriptors, don't appear in the tool catalog, and aren't
// executed by ToolExecutorService. They're merged directly into the ToolSet
// handed to streamText.
export interface NativeToolBinder {
  readonly category: ToolCategory;

  isAvailable(context: ToolProviderContext): Promise<boolean>;

  bind(context: ToolProviderContext): Promise<ToolSet>;
}
