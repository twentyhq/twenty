import { isNonEmptyString } from '@sniptt/guards';
import isEqual from 'lodash.isequal';
import {
  buildFallbackProposedToolCall,
  PROPOSED_TOOL_CALL_TEMPLATES,
  type ProposeToolCallToolInput,
  type ProposeToolCallToolResult,
  type ProposedToolCall,
  type ToolCallApprovalResponse,
} from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { z } from 'zod';

import { definePausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/define-pausing-tool.util';
import { readRecordFieldValues } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/read-record-field-values.util';
import { resolveEmailToolCallProposal } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-email-tool-call-proposal.util';

const proposeToolCallInputSchema = z.object({
  toolName: z
    .string()
    .trim()
    .min(1)
    .describe(
      'The name of the tool to run once approved, as you would call it yourself.',
    ),
  arguments: z
    .record(z.string(), z.unknown())
    .describe(
      "The tool's arguments, matching its input schema. Call learn_tools first if you have not seen the schema.",
    ),
  summary: z
    .string()
    .trim()
    .min(1)
    .describe(
      'One sentence on what the call does and why, shown to the person deciding (e.g. "Raise the Acme renewal to 120k based on the signed quote").',
    ),
});

const proposedToolCallSchema: z.ZodType<ProposedToolCall> = z.object({
  toolName: z.string(),
  toolLabel: z.string(),
  summary: z.string(),
  arguments: z.record(z.string(), z.unknown()),
  template: z.enum(PROPOSED_TOOL_CALL_TEMPLATES),
  alternativeToolNames: z.array(z.string()).optional(),
  objectNameSingular: z.string().optional(),
  recordId: z.string().optional(),
  currentValues: z.record(z.string(), z.unknown()).optional(),
});

// the person may run the proposed tool or one of the alternatives it offers, and an update
// may only change the fields it proposed, since only those were snapshotted to detect a conflict
const buildToolCallApprovalResponseSchema = (
  proposal: ProposedToolCall,
): z.ZodType<ToolCallApprovalResponse> => {
  const allowedToolNames = new Set([
    proposal.toolName,
    ...(proposal.alternativeToolNames ?? []),
  ]);
  const proposedArgumentNames = new Set(Object.keys(proposal.arguments));

  const responseSchema = z.discriminatedUnion('decision', [
    z.object({
      decision: z.literal('approve'),
      toolName: z
        .string()
        .refine((toolName) => allowedToolNames.has(toolName), {
          message:
            'This call can only run the proposed tool or one of its alternatives.',
        })
        .optional(),
      arguments: z.record(z.string(), z.unknown()).optional(),
      feedback: z.string().optional(),
    }),
    z.object({
      decision: z.literal('reject'),
      feedback: z.string().optional(),
    }),
  ]);

  return responseSchema.superRefine((response, context) => {
    if (
      proposal.template === 'recordUpdate' &&
      response.decision === 'approve' &&
      Object.keys(response.arguments ?? {}).some(
        (argumentName) => !proposedArgumentNames.has(argumentName),
      )
    ) {
      context.addIssue({
        code: 'custom',
        message: 'An approved update can only change the fields it proposed.',
      });
    }
  });
};

// a call whose resolved proposal cannot be read can still be shown, rejected or skipped as a
// generic one, but never run: its record, snapshot and allowed edits are gone
const readProposal = (
  input: ProposeToolCallToolInput,
  pendingToolOutput: unknown,
): { proposal: ProposedToolCall; isReadable: boolean } => {
  const parsedProposal = proposedToolCallSchema.safeParse(
    isPlainObject(pendingToolOutput) && isPlainObject(pendingToolOutput.result)
      ? pendingToolOutput.result.proposal
      : undefined,
  );

  return parsedProposal.success
    ? { proposal: parsedProposal.data, isReadable: true }
    : {
        proposal: buildFallbackProposedToolCall(input),
        isReadable: false,
      };
};

// the record and the sending account are fixed when proposed, since no card lets the person
// change them, so an edit cannot retarget the call
const buildApprovedArguments = (
  proposal: ProposedToolCall,
  editedArguments: Record<string, unknown> | undefined,
): Record<string, unknown> => {
  const toolArguments = editedArguments ?? proposal.arguments;

  if (isDefined(proposal.recordId)) {
    return { ...toolArguments, id: proposal.recordId };
  }

  if (proposal.template === 'email') {
    const { connectedAccountId: _editedAccountId, ...emailArguments } =
      toolArguments;
    const { connectedAccountId } = proposal.arguments;

    return isDefined(connectedAccountId)
      ? { ...emailArguments, connectedAccountId }
      : emailArguments;
  }

  return toolArguments;
};

const buildApprovalAnswerText = (
  proposal: ProposedToolCall,
  approvedToolName: string,
  feedback: string | undefined,
): string => {
  const approval =
    approvedToolName === proposal.toolName
      ? `Approve "${proposal.summary}"`
      : `Approve "${proposal.summary}", running ${approvedToolName} instead`;

  return isNonEmptyString(feedback)
    ? `${approval}: ${feedback}`
    : `${approval}.`;
};

export const PROPOSE_TOOL_CALL_PAUSING_TOOL = definePausingTool<
  ProposeToolCallToolInput,
  ToolCallApprovalResponse
>({
  description:
    'Propose a tool call for a person to approve before it runs, instead of calling the tool yourself. ' +
    'Most calls need no approval: use this only when the action is hard to undo or reaches people outside ' +
    'the workspace, when you are unsure it matches what the person wants, or when your instructions ask ' +
    'for approval. Never use it for reads. The conversation pauses until the person approves it, possibly ' +
    'after editing the arguments, or rejects it with optional feedback. You then get the tool result or ' +
    'their feedback. Propose one call at a time. To have an email reviewed before it goes out, propose ' +
    'send_email or draft_email with the arguments you would send it with: the person can edit it, ' +
    'send it, save it as a draft or discard it.',
  inputSchema: proposeToolCallInputSchema,
  prepare: async (
    input,
    {
      resolveProposal = async (emailInput) =>
        resolveEmailToolCallProposal(emailInput),
    },
  ) => {
    const resolution = await resolveProposal(input);

    return 'error' in resolution
      ? resolution
      : { pendingResult: { proposal: resolution.proposal } };
  },
  preview: (input, pendingToolOutput) =>
    readProposal(input, pendingToolOutput).proposal.summary || null,
  outputSchema: (input, pendingToolOutput) =>
    buildToolCallApprovalResponseSchema(
      readProposal(input, pendingToolOutput).proposal,
    ),
  complete: async ({ output, input, pendingToolOutput, context }) => {
    const { proposal, isReadable } = readProposal(input, pendingToolOutput);
    const feedback = output.feedback?.trim();
    const hasFeedback = isNonEmptyString(feedback);

    if (output.decision === 'reject') {
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

    const approvedToolName = isReadable
      ? (output.toolName ?? proposal.toolName)
      : proposal.toolName;
    const answerText = buildApprovalAnswerText(
      proposal,
      approvedToolName,
      feedback,
    );

    // feedback given with an approval steers what the agent does next, so it travels with every outcome
    const buildApprovalCompletion = ({
      success,
      message,
      result,
    }: {
      success: boolean;
      message: string;
      result: Omit<ProposeToolCallToolResult, 'feedback'>;
    }) => ({
      toolResult: {
        success,
        message: hasFeedback
          ? `${message} The user added: ${feedback}`
          : message,
        result: {
          ...result,
          ...(hasFeedback ? { feedback } : {}),
        } satisfies ProposeToolCallToolResult,
      },
      answerText,
    });

    if (!isReadable) {
      return buildApprovalCompletion({
        success: false,
        message:
          'The user approved the call, but its proposal could not be read back, so nothing was run. Propose it again if it is still needed.',
        result: {
          status: 'failed',
          proposal,
          error:
            'The proposed call could not be read back, so nothing was run.',
        },
      });
    }

    const approvedProposal: ProposedToolCall = {
      ...proposal,
      toolName: approvedToolName,
      arguments: buildApprovedArguments(proposal, output.arguments),
    };

    // the call was claimed as running before this, so it must end with an outcome rather than a throw
    try {
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

        // an update whose record cannot be read again cannot be shown to be safe, so it does not run
        if (!latestRecord.isFound) {
          return buildApprovalCompletion({
            success: false,
            message: `The user approved the call, but the record could not be read again, so nothing was run: ${latestRecord.error}`,
            result: {
              status: 'failed',
              proposal: approvedProposal,
              error: latestRecord.error,
            },
          });
        }

        if (!isEqual(latestRecord.values, currentValues)) {
          return buildApprovalCompletion({
            success: false,
            message:
              'The user approved the call, but the record changed since it was proposed, so nothing was run. Read the record again and propose a new call if it is still needed.',
            result: {
              status: 'conflict',
              proposal: approvedProposal,
              output: { latestValues: latestRecord.values },
            },
          });
        }
      }

      const toolOutput = await context.executeTool({
        toolName: approvedProposal.toolName,
        args: approvedProposal.arguments,
      });

      return buildApprovalCompletion(
        toolOutput.success
          ? {
              success: true,
              message: `The user approved the call. ${toolOutput.message}`,
              result: {
                status: 'approved',
                proposal: approvedProposal,
                output: toolOutput.result,
              },
            }
          : {
              success: false,
              message: `The user approved the call, but it failed: ${toolOutput.error ?? toolOutput.message}`,
              result: {
                status: 'failed',
                proposal: approvedProposal,
                error: toolOutput.error ?? toolOutput.message,
              },
            },
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return buildApprovalCompletion({
        success: false,
        message: `The user approved the call, but it failed: ${errorMessage}`,
        result: {
          status: 'failed',
          proposal: approvedProposal,
          error: errorMessage,
        },
      });
    }
  },
  // only an approval runs something, so a rejection is never claimed
  toRunningToolResult: ({ output, input, pendingToolOutput }) =>
    output.decision === 'approve'
      ? {
          success: true,
          message: 'The user approved the call and it is running.',
          result: {
            status: 'running',
            proposal: readProposal(input, pendingToolOutput).proposal,
          } satisfies ProposeToolCallToolResult,
        }
      : undefined,
  toInterruptedToolResult: (input, runningToolOutput) => ({
    success: false,
    message:
      'The user approved the call, but it was interrupted before its outcome was recorded, so it may or may not have run. Check before proposing it again.',
    result: {
      status: 'failed',
      proposal: readProposal(input, runningToolOutput).proposal,
      error:
        'Interrupted before its outcome was recorded. It may or may not have run.',
    } satisfies ProposeToolCallToolResult,
  }),
  toSkippedToolResult: (input, pendingToolOutput) => ({
    success: true,
    message:
      'User sent another message instead of deciding on the proposed call. It was not run.',
    result: {
      status: 'skipped',
      proposal: readProposal(input, pendingToolOutput).proposal,
    } satisfies ProposeToolCallToolResult,
  }),
});
