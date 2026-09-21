import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { z } from 'zod';

const toolRecordOutputSchema = z.object({
  message: z.string().optional(),
  recordReferences: z.array(
    z.object({
      objectNameSingular: z.string(),
      recordId: z.string(),
      displayName: z.string(),
    }),
  ),
});

const EMPTY_TOOL_RECORD_OUTPUT = {
  message: undefined,
  recordReferences: [],
} satisfies z.infer<typeof toolRecordOutputSchema>;

export const getToolRecordOutput = (
  toolPart: ToolUIPart | DynamicToolUIPart,
) => {
  if (toolPart.state !== 'output-available') {
    return EMPTY_TOOL_RECORD_OUTPUT;
  }

  const parsed = toolRecordOutputSchema.safeParse(toolPart.output);

  return parsed.success ? parsed.data : EMPTY_TOOL_RECORD_OUTPUT;
};
