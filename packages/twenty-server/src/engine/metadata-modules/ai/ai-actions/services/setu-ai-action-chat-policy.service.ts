import { Injectable } from '@nestjs/common';

import { PROPOSE_CRM_ACTION_TOOL_NAME } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type SetuAiActionPolicy } from 'src/engine/core-modules/tool-provider/types/setu-ai-action-policy.type';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { SetuAiActionService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action.service';
import { SetuAiActionException } from 'src/engine/metadata-modules/ai/ai-actions/setu-ai-action.exception';
import { type SetuAiActionActor } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-actor.type';
import { type SetuAiActionProposalInput } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-proposal-input.type';
import {
  buildSetuAiActionProposalFailureOutput,
  buildSetuAiActionProposalOutput,
} from 'src/engine/metadata-modules/ai/ai-actions/utils/build-setu-ai-action-proposal-output.util';
import { computeSetuAiActionPayloadHash } from 'src/engine/metadata-modules/ai/ai-actions/utils/compute-setu-ai-action-payload-hash.util';
import { toSetuAiActionProposalInput } from 'src/engine/metadata-modules/ai/ai-actions/utils/to-setu-ai-action-proposal-input.util';

const proposeCrmActionInputSchema = z.object({
  kind: z.enum(['send_email', 'update_record_fields']),
  sendEmail: z
    .object({
      to: z.array(z.string()).describe('Recipient email addresses'),
      cc: z.array(z.string()).optional(),
      bcc: z.array(z.string()).optional(),
      subject: z.string(),
      body: z
        .string()
        .describe('Plain text. Separate paragraphs with a blank line.'),
      connectedAccountId: z
        .string()
        .optional()
        .describe('Only when the user chose a specific sending account'),
    })
    .optional()
    .describe('Required when kind is send_email'),
  updateRecordFields: z
    .object({
      objectNameSingular: z.string().describe('e.g. "opportunity"'),
      recordId: z.string(),
      fields: z
        .record(z.string(), z.unknown())
        .describe('Field name to new value, scalar fields only'),
    })
    .optional()
    .describe('Required when kind is update_record_fields'),
  reviseActionId: z
    .string()
    .optional()
    .describe(
      'To change an action already proposed in this chat, its id from the earlier result',
    ),
  expectedStateVersion: z
    .number()
    .int()
    .optional()
    .describe('Required with reviseActionId'),
});

type ProposeCrmActionInput = z.infer<typeof proposeCrmActionInputSchema>;

// Builds the chat's trusted half of the policy: the person, workspace and
// thread come from the authenticated chat context, never from tool input.
@Injectable()
export class SetuAiActionChatPolicyService {
  constructor(private readonly setuAiActionService: SetuAiActionService) {}

  createPolicy(toolContext: ToolContext): SetuAiActionPolicy {
    return {
      proposeAction: async (proposal) => {
        try {
          return await this.propose({
            toolContext,
            input: toSetuAiActionProposalInput(proposal),
            deduplicationSuffix:
              proposal.toolCallId ??
              computeSetuAiActionPayloadHash({
                toolName: proposal.toolName,
                arguments: proposal.arguments,
              }),
          });
        } catch (error) {
          return buildSetuAiActionProposalFailureOutput(error);
        }
      },
    };
  }

  createProposeCrmActionTool(toolContext: ToolContext) {
    return {
      description:
        `Prepare an email or a CRM field change for the user to review. Nothing is sent or changed: ` +
        `the user approves, edits or rejects it in a review card, and only an approval runs it. ` +
        `Use it instead of send_email or record updates. A successful result means the proposal exists, ` +
        `not that it ran. Supports one personal plain-text email (no attachments) or scalar field changes on one record. ` +
        `To change a proposal (for example "make it shorter"), pass reviseActionId and expectedStateVersion; ` +
        `never create a second proposal for the same email. Never claim the user approved anything.`,
      inputSchema: proposeCrmActionInputSchema,
      execute: async (
        input: ProposeCrmActionInput,
        executionOptions?: { toolCallId?: string },
      ): Promise<ToolOutput> => {
        try {
          return await this.handleProposeCrmAction({
            toolContext,
            input,
            toolCallId: executionOptions?.toolCallId,
          });
        } catch (error) {
          return buildSetuAiActionProposalFailureOutput(error);
        }
      },
    };
  }

  private async handleProposeCrmAction({
    toolContext,
    input,
    toolCallId,
  }: {
    toolContext: ToolContext;
    input: ProposeCrmActionInput;
    toolCallId?: string;
  }): Promise<ToolOutput> {
    const proposalInput: SetuAiActionProposalInput | undefined =
      input.kind === 'send_email' && isDefined(input.sendEmail)
        ? { kind: 'send_email', sendEmail: input.sendEmail }
        : input.kind === 'update_record_fields' &&
            isDefined(input.updateRecordFields)
          ? {
              kind: 'update_record_fields',
              updateRecordFields: input.updateRecordFields,
            }
          : undefined;

    if (!isDefined(proposalInput)) {
      throw new SetuAiActionException(
        `Provide ${input.kind === 'send_email' ? 'sendEmail' : 'updateRecordFields'} for this kind`,
        'INVALID_INPUT',
      );
    }

    if (isDefined(input.reviseActionId)) {
      if (!isDefined(input.expectedStateVersion)) {
        throw new SetuAiActionException(
          'expectedStateVersion is required to revise',
          'INVALID_INPUT',
        );
      }

      const action = await this.setuAiActionService.revise({
        actor: this.buildActor(toolContext),
        actionRequestId: input.reviseActionId,
        expectedStateVersion: input.expectedStateVersion,
        edits:
          proposalInput.kind === 'send_email'
            ? proposalInput.sendEmail
            : { fields: proposalInput.updateRecordFields.fields },
      });

      return buildSetuAiActionProposalOutput(action);
    }

    return this.propose({
      toolContext,
      input: proposalInput,
      deduplicationSuffix:
        toolCallId ??
        computeSetuAiActionPayloadHash({
          toolName: PROPOSE_CRM_ACTION_TOOL_NAME,
          arguments: input,
        }),
    });
  }

  private async propose({
    toolContext,
    input,
    deduplicationSuffix,
  }: {
    toolContext: ToolContext;
    input: SetuAiActionProposalInput;
    deduplicationSuffix: string;
  }): Promise<ToolOutput> {
    const action = await this.setuAiActionService.propose({
      input,
      actor: this.buildActor(toolContext),
      threadId: toolContext.threadId ?? null,
      deduplicationKey: `chat:${toolContext.threadId ?? 'none'}:${deduplicationSuffix}`,
    });

    return buildSetuAiActionProposalOutput(action);
  }

  private buildActor(toolContext: ToolContext): SetuAiActionActor {
    if (
      !isDefined(toolContext.userWorkspaceId) ||
      !isDefined(toolContext.authContext) ||
      !isDefined(toolContext.rolePermissionConfig)
    ) {
      throw new SetuAiActionException(
        'A signed-in person is required',
        'NOT_AVAILABLE',
      );
    }

    return {
      workspaceId: toolContext.workspaceId,
      userWorkspaceId: toolContext.userWorkspaceId,
      authContext: toolContext.authContext,
      rolePermissionConfig: toolContext.rolePermissionConfig,
    };
  }
}
