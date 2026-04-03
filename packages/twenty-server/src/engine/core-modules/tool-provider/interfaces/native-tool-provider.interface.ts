import { type ToolSet } from 'ai';
import { type ToolCategory } from 'twenty-shared/ai';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

export interface NativeToolProvider {
  readonly category: ToolCategory;

  isAvailable(context: ToolProviderContext): Promise<boolean>;

  generateTools(context: ToolProviderContext): Promise<ToolSet>;
}
