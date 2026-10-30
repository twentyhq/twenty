import { z } from 'zod';

const mcpToolCallParamsSchema = z.object({
  name: z.string().min(1),
  arguments: z.record(z.string(), z.unknown()).nullish(),
  // A malformed progress token only disables progress notifications, it does not fail the call
  _meta: z
    .object({
      progressToken: z.union([z.string(), z.number().int()]).optional(),
    })
    .optional()
    .catch(undefined),
});

export const parseMcpToolCallParams = (
  params: Record<string, unknown> | undefined,
) => {
  const parsed = mcpToolCallParamsSchema.safeParse(params);

  if (!parsed.success) {
    return undefined;
  }

  return {
    toolName: parsed.data.name,
    toolArguments: parsed.data.arguments ?? undefined,
    progressToken: parsed.data._meta?.progressToken,
  };
};
