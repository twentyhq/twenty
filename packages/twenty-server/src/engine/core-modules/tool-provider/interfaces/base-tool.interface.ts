import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolInputSchema } from 'src/engine/core-modules/tool-provider/types/tool-input-schema.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export abstract class BaseTool<
  TInputSchema extends ToolInputSchema = ToolInputSchema,
> {
  // Makes the type nominal: @DefineTool rejects look-alike classes that would fail instanceof at boot
  protected readonly isBaseTool = true;

  abstract readonly inputSchema: TInputSchema;

  abstract execute(args: ToolExecuteArgs<TInputSchema>): Promise<ToolOutput>;
}
