import { type z } from 'zod';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export abstract class BaseTool<TInputSchema extends z.ZodObject = z.ZodObject> {
  // Makes the type nominal: @DefineTool rejects look-alike classes that would fail instanceof at boot
  protected readonly isBaseTool = true;

  abstract readonly inputSchema: TInputSchema;

  abstract execute(
    input: z.infer<TInputSchema>,
    context: ToolProviderContext,
  ): Promise<ToolOutput>;
}
