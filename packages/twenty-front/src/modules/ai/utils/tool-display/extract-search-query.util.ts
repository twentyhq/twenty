import { z } from 'zod';

import { type ToolInput } from '@/ai/types/ToolInput';

const DirectQuerySchema = z.object({ query: z.string() });
const NestedQuerySchema = z.object({
  action: z.object({ query: z.string() }),
});

export const extractSearchQuery = (input: ToolInput): string | null => {
  const direct = DirectQuerySchema.safeParse(input);

  if (direct.success) {
    return direct.data.query;
  }

  const nested = NestedQuerySchema.safeParse(input);

  if (nested.success) {
    return nested.data.action.query;
  }

  return null;
};
