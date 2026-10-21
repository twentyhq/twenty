import { type z } from 'zod';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolInputSchema } from 'src/engine/core-modules/tool-provider/types/tool-input-schema.type';

export type ToolExecuteArgs<
  TInputSchema extends ToolInputSchema = ToolInputSchema,
> = {
  input: z.infer<TInputSchema>;
  context: ToolProviderContext;
};
