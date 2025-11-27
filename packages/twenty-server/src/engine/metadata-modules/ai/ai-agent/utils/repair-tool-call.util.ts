import { generateObject, type LanguageModel, NoSuchToolError } from 'ai';
import { type z } from 'zod';

import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';

type ToolCall = {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  input: string;
};

export const repairToolCall = async ({
  toolCall,
  tools,
  inputSchema,
  error,
  model,
}: {
  toolCall: ToolCall;
  tools: Record<string, unknown>;
  inputSchema: (toolCall: { toolName: string }) => unknown;
  error: Error;
  model: LanguageModel;
}): Promise<ToolCall | null> => {
  // Don't attempt to fix invalid tool names
  if (NoSuchToolError.isInstance(error)) {
    return null;
  }

  const tool = tools[toolCall.toolName];

  if (!tool || typeof tool !== 'object' || !('inputSchema' in tool)) {
    return null;
  }

  const schema = inputSchema(toolCall);

  if (!schema || typeof schema !== 'object') {
    return null;
  }

  try {
    const { object: repairedInput } = await generateObject({
      model,
      schema: schema as z.ZodTypeAny,
      prompt: [
        `The AI model attempted to call the tool "${toolCall.toolName}" with invalid input.`,
        ``,
        `Input provided:`,
        JSON.stringify(toolCall.input, null, 2),
        ``,
        `Error encountered:`,
        error.message,
        ``,
        `Please fix the input to exactly match the required schema.`,
        `Pay special attention to:`,
        `- Enum values must match exactly (e.g., "DescNullsLast" not "desc")`,
        `- Object structures must match the schema shape`,
        `- Array items must follow the specified format`,
      ].join('\n'),
      experimental_telemetry: AI_TELEMETRY_CONFIG,
    });

    return {
      type: 'tool-call',
      toolCallId: toolCall.toolCallId,
      toolName: toolCall.toolName,
      input: JSON.stringify(repairedInput),
    };
  } catch {
    // If repair fails, return null to let the error propagate
    return null;
  }
};
