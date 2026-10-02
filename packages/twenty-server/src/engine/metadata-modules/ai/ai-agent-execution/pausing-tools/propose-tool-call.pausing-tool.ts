import { isNonEmptyString } from '@sniptt/guards';
import isEqual from 'lodash.isequal';
import {
  type ProposeToolCallToolInput,
  type ProposeToolCallToolResult,
  type ProposedToolCall,
  type ToolCallApprovalResponse,
} from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { z } from 'zod';

import { definePausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/define-pausing-tool.util';
import { readRecordFieldValues } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/read-record-field-values.util';
import {
  proposeToolCallInputSchema,
  proposedToolCallSchema,
} from 'src/engine/metadata-modules/ai/ai-chat/tools/propose-tool-call.tool';

const toolCallApprovalResponseSchema: z.ZodType<ToolCallApprovalResponse> =
  z.discriminatedUnion('decision', [
    z.object({
      decision: z.literal('approve'),
      arguments: z.record(z.string(), z.unknown()).optional(),
    }),
    z.object({
      decision: z.literal('reject'),
      feedback: z.string().optional(),
    }),
  ]);

// a call recorded without its resolved proposal is still answerable, as a generic one
const readProposal = (
  input: ProposeToolCallToolInput,
  pendingToolOutput: unknown,
): ProposedToolCall => {
  const parsedProposal = proposedToolCallSchema.safeParse(
    isPlainObject(pendingToolOutput) && isPlainObject(pendingToolOutput.result)
      ? pendingToolOutput.result.proposal
      : undefined,
  );

  return parsedProposal.success
    ? parsedProposal.data
    : { ...input, toolLabel: input.toolName, template: 'generic' };
};

// the record is fixed when proposed, so an edit cannot retarget the call
const buildApprovedArguments = (
  proposal: ProposedToolCall,
  editedArguments: Record<string, unknown> | undefined,
): Record<string, unknown> => {
  const toolArguments = editedArguments ?? proposal.arguments;

  return isDefined(proposal.recordId)
    ? { ...toolArguments, id: proposal.recordId }
    : toolArguments;
};

export const PROPOSE_TOOL_CALL_PAUSING_TOOL = definePausingTool<
  ProposeToolCallToolInput,
  ToolCallApprovalResponse
>({
  inputSchema: proposeToolCallInputSchema,
  outputSchema: () => toolCallApprovalResponseSchema,
  complete: async ({ output, input, pendingToolOutput, context }) => {
    const proposal = readProposal(input, pendingToolOutput);

    if (output.decision === 'reject') {
      const feedback = output.feedback?.trim();
      const hasFeedback = isNonEmptyString(feedback);

      return {
        toolResult: {
          success: true,
          message: hasFeedback
            ? `The user rejected the call with this feedback: ${feedback}`
            : 'The user rejected the call. Do not run it.',
          result: {
            status: 'rejected',
            proposal,
            ...(hasFeedback ? { feedback } : {}),
          } satisfies ProposeToolCallToolResult,
        },
        answerText: hasFeedback
          ? `Reject "${proposal.summary}": ${feedback}`
          : `Reject "${proposal.summary}".`,
      };
    }

    const approvedProposal: ProposedToolCall = {
      ...proposal,
      arguments: buildApprovedArguments(proposal, output.arguments),
    };
    const { currentValues, objectNameSingular, recordId } = approvedProposal;

    if (
      isDefined(currentValues) &&
      isDefined(objectNameSingular) &&
      isDefined(recordId) &&
      Object.keys(currentValues).length > 0
    ) {
      const latestRecord = await readRecordFieldValues({
        executeTool: context.executeTool,
        objectNameSingular,
        recordId,
        fieldNames: Object.keys(currentValues),
      });

      if (
        latestRecord.isFound &&
        !isEqual(latestRecord.values, currentValues)
      ) {
        return {
          toolResult: {
            success: false,
            message:
              'The user approved the call, but the record changed since it was proposed, so nothing was run. Read the record again and propose a new call if it is still needed.',
            result: {
              status: 'conflict',
              proposal: approvedProposal,
              output: { latestValues: latestRecord.values },
            } satisfies ProposeToolCallToolResult,
          },
          answerText: `Approve "${proposal.summary}".`,
        };
      }
    }

    const toolOutput = await context.executeTool({
      toolName: approvedProposal.toolName,
      args: approvedProposal.arguments,
    });

    return {
      toolResult: {
        success: toolOutput.success,
        message: toolOutput.success
          ? `The user approved the call. ${toolOutput.message}`
          : `The user approved the call, but it failed: ${toolOutput.error ?? toolOutput.message}`,
        result: {
          status: toolOutput.success ? 'approved' : 'failed',
          proposal: approvedProposal,
          ...(toolOutput.success
            ? { output: toolOutput.result }
            : { error: toolOutput.error ?? toolOutput.message }),
        } satisfies ProposeToolCallToolResult,
      },
      answerText: `Approve "${proposal.summary}".`,
    };
  },
  toSkippedToolResult: (input, pendingToolOutput) => ({
    success: true,
    message:
      'User sent another message instead of deciding on the proposed call. It was not run.',
    result: {
      status: 'skipped',
      proposal: readProposal(input, pendingToolOutput),
    } satisfies ProposeToolCallToolResult,
  }),
});
