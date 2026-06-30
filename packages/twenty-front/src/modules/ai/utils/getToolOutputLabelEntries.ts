import { z } from 'zod';

const LabelEntrySchema = z.object({
  name: z.string(),
  label: z.string().optional(),
});

const ToolOutputWithLabelsSchema = z.object({
  tools: z.array(LabelEntrySchema).optional(),
  skills: z.array(LabelEntrySchema).optional(),
});

export const getToolOutputLabelEntries = (
  output: unknown,
): Array<{ name: string; label: string }> => {
  const parsed = ToolOutputWithLabelsSchema.safeParse(output);

  if (!parsed.success) {
    return [];
  }

  return [...(parsed.data.tools ?? []), ...(parsed.data.skills ?? [])].flatMap(
    (entry) => (entry.label ? [{ name: entry.name, label: entry.label }] : []),
  );
};
