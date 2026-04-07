import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export interface StaticToolHandler {
  execute(args: ToolInput, context: ToolProviderContext): Promise<ToolOutput>;
}
