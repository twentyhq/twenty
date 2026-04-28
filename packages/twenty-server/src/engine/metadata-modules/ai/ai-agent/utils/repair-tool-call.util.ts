import {
  type LanguageModel,
  type LanguageModelUsage,
  NoSuchToolError,
  Output,
  type StepResult,
  type ToolSet,
  generateText,
} from 'ai';
import { type z } from 'zod';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { extractCacheCreationTokensFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';

type ToolCall = {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  input: string;
};

type RepairToolCallBillingContext = {
  aiBillingService: AiBillingService;
  modelId: string;
  workspaceId: string;
  userWorkspaceId: string | null;
  operationType: UsageOperationType;
};

export const repairToolCall = async ({
  toolCall,
  tools,
  inputSchema,
  error,
  model,
  billingContext,
}: {
  toolCall: ToolCall;
  tools: Record<string, unknown>;
  inputSchema: (toolCall: { toolName: string }) => unknown;
  error: Error;
  model: LanguageModel;
  billingContext?: RepairToolCallBillingContext;
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

  let usage: LanguageModelUsage | undefined;
  let steps: StepResult<ToolSet>[] | undefined;

  try {
    const result = await generateText({
      model,
      output: Output.object({ schema: schema as z.ZodTypeAny }),
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

    usage = result.usage;
    steps = result.steps;

    const repairedInput = result.output;

    if (repairedInput == null) {
      return null;
    }

    return {
      type: 'tool-call',
      toolCallId: toolCall.toolCallId,
      toolName: toolCall.toolName,
      input: JSON.stringify(repairedInput),
    };
  } catch {
    // If repair fails, return null to let the error propagate
    return null;
  } finally {
    if (billingContext && usage) {
      const cacheCreationTokens = steps
        ? extractCacheCreationTokensFromSteps(steps)
        : 0;

      billingContext.aiBillingService.calculateAndBillUsage(
        billingContext.modelId,
        { usage, cacheCreationTokens },
        billingContext.workspaceId,
        billingContext.operationType,
        null,
        billingContext.userWorkspaceId,
      );
    }
  }
};
