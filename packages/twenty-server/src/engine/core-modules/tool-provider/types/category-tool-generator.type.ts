import { type ToolSet } from 'ai';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

export type CategoryToolGenerator = (
  context: ToolProviderContext,
) => Promise<ToolSet>;
