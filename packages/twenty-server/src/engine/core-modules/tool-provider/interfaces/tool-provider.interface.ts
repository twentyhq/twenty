import { type ToolCategory } from 'twenty-shared/ai';

import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export interface ToolProvider {
  readonly category: ToolCategory;

  isAvailable(context: ToolProviderContext): Promise<boolean>;

  generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]>;

  // Execute a tool whose descriptor has `executionRef.kind === 'static'` and
  // `descriptor.category === this.category`. Providers own the execution of
  // the tools they emit.
  //
  // Providers that never emit 'static' descriptors (database CRUD, logic
  // functions) should throw — the call is unreachable by construction.
  executeStaticTool(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput>;
}
