import { isNonEmptyString } from '@sniptt/guards';
import {
  type EmailApprovalDecision,
  type ProposeEmailToolResult,
  type ProposedEmail,
} from 'twenty-shared/ai';
import {
  convertPlainTextToEmailDocument,
  isDefined,
  isPlainObject,
} from 'twenty-shared/utils';
import { z } from 'zod';

import { definePausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/define-pausing-tool.util';
import { proposeEmailInputSchema } from 'src/engine/metadata-modules/ai/ai-chat/tools/propose-email.tool';

type ProposeEmailToolOutput = {
  decision: EmailApprovalDecision;
  email?: ProposedEmail;
};

const proposeEmailOutputSchema: z.ZodType<ProposeEmailToolOutput> = z
  .object({
    decision: z.enum(['send', 'saveDraft', 'discard']),
    email: proposeEmailInputSchema.optional(),
  })
  .superRefine(({ decision, email }, context) => {
    if (decision === 'send' && !isNonEmptyString(email?.recipients.to.trim())) {
      context.addIssue({
        code: 'custom',
        message: 'Add at least one recipient to send the email.',
      });
    }
  });

const buildResult = ({
  status,
  email,
  error,
}: {
  status: ProposeEmailToolResult['status'];
  email: ProposedEmail;
  error?: string;
}): ProposeEmailToolResult => ({
  status,
  email,
  ...(isDefined(error) ? { error } : {}),
});

const DECISION_TOOLS = {
  send: { toolName: 'send_email', status: 'sent' },
  saveDraft: { toolName: 'draft_email', status: 'drafted' },
} as const;

// Sending or drafting runs the regular email tools as the person who
// approved, so their connected accounts and permissions decide what happens.
export const PROPOSE_EMAIL_PAUSING_TOOL = definePausingTool<
  ProposedEmail,
  ProposeEmailToolOutput
>({
  inputSchema: proposeEmailInputSchema,
  outputSchema: () => proposeEmailOutputSchema,
  buildAsk: (email) => ({
    name: email.subject.trim(),
    form: { kind: 'emailApproval', email },
  }),
  complete: async ({ output: { decision, email }, input, context }) => {
    // The person may edit what is sent, not which account sends it: the card
    // offers no choice of account, so one in the answer is not theirs to pick.
    const finalEmail = {
      ...(email ?? input),
      connectedAccountId: input.connectedAccountId,
    };

    if (decision === 'discard') {
      return {
        toolResult: {
          success: true,
          message: 'The user discarded the email.',
          result: buildResult({ status: 'discarded', email: input }),
        },
        answerText: `Discard the email "${input.subject}".`,
      };
    }

    const { toolName, status } = DECISION_TOOLS[decision];

    const toolOutput = await context.executeTool({
      toolName,
      args: {
        recipients: finalEmail.recipients,
        subject: finalEmail.subject,
        body: convertPlainTextToEmailDocument(finalEmail.body),
        ...(isDefined(finalEmail.connectedAccountId)
          ? { connectedAccountId: finalEmail.connectedAccountId }
          : {}),
      },
    });

    return {
      toolResult: {
        success: toolOutput.success,
        message: toolOutput.success
          ? toolOutput.message
          : `The user approved the email, but it could not go through: ${toolOutput.error ?? toolOutput.message}`,
        result: {
          ...buildResult({
            status: toolOutput.success ? status : 'failed',
            email: finalEmail,
            error: toolOutput.success ? undefined : toolOutput.error,
          }),
          ...(isPlainObject(toolOutput.result)
            ? { details: toolOutput.result }
            : {}),
        },
      },
      answerText:
        decision === 'send'
          ? `Send the email "${finalEmail.subject}" to ${finalEmail.recipients.to}.`
          : `Save the email "${finalEmail.subject}" as a draft.`,
    };
  },
  toSkippedToolResult: (email) => ({
    success: true,
    message: 'User sent another message instead of deciding on the email.',
    result: buildResult({ status: 'skipped', email }),
  }),
});
