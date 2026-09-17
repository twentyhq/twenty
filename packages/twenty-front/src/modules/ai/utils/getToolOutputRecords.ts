import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { z } from 'zod';

const toolRecordReferencesSchema = z.object({
  recordReferences: z.array(
    z.object({
      objectNameSingular: z.string(),
      recordId: z.string(),
      displayName: z.string(),
    }),
  ),
});

export const getToolOutputRecords = (
  toolPart: ToolUIPart | DynamicToolUIPart,
) => {
  if (toolPart.state !== 'output-available') {
    return [];
  }

  const parsed = toolRecordReferencesSchema.safeParse(toolPart.output);

  return parsed.success ? parsed.data.recordReferences : [];
};
