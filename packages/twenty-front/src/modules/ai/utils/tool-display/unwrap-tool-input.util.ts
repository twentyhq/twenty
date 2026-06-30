import { z } from 'zod';

import { type ToolInput } from '@/ai/types/ToolInput';

const ExecuteToolSchema = z.object({
  toolName: z.coerce.string(),
  arguments: z.unknown(),
});

export const unwrapToolInput = ({
  input,
  toolName,
}: {
  input: ToolInput;
  toolName: string;
}): {
  toolInput: ToolInput;
  toolName: string;
} => {
  if (toolName !== 'execute_tool') {
    return { toolInput: input, toolName };
  }

  const parsed = ExecuteToolSchema.safeParse(input);

  if (!parsed.success) {
    return { toolInput: input, toolName };
  }

  return {
    toolInput: parsed.data.arguments as ToolInput,
    toolName: parsed.data.toolName,
  };
};
