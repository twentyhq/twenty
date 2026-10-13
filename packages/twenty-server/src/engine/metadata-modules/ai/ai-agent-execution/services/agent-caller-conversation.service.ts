import { Injectable } from '@nestjs/common';

import { PROPOSE_TOOL_CALL_TOOL_NAME } from 'twenty-shared/ai';
import { type SendInboxMessageInput } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { buildProposeToolCallPendingOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/propose-tool-call.pausing-tool';
import { type ProposedToolCallAnswer } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/proposed-tool-call-answer.type';
import { findMissingRequiredToolArguments } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-missing-required-tool-arguments.util';
import { readProposedToolCallAnswer } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/read-proposed-tool-call-answer.util';
import { resolveProposedToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-proposed-tool-call.util';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunConversation } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-conversation.type';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { type AgentInboxSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-sender.type';
import { readToolCallStatus } from 'src/engine/metadata-modules/ai/ai-history/utils/read-tool-call-status.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { getRoleIdsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-role-ids-from-role-permission-config.util';

const MAX_ASK_ATTEMPTS = 10;

const isThreadNotFoundError = (error: unknown) =>
  error instanceof AiException &&
  error.code === AiExceptionCode.THREAD_NOT_FOUND;

type AgentCallerAwaitedToolCall = {
  toolName: string;
  arguments: Record<string, unknown>;
  caller: AgentRunCaller;
  // called before the call is posted, so its answer always finds the caller waiting
  waitOnAnswer: (postedCall: {
    threadId: string;
    toolCallId: string;
  }) => Promise<void>;
};

// The conversations a caller, such as a workflow step, holds with a member's inbox: the one its agent
// run writes to, and the messages it sends itself, which may ask the member to approve a call. The
// caller waits on that answer with an ANSWER wake-up, which the answer resolves
@Injectable()
export class AgentCallerConversationService {
  constructor(
    private readonly agentInboxService: AgentInboxService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly toolRegistryService: ToolRegistryService,
  ) {}

  // A conversation the run opens is filed under done, and only comes back to
  // the inbox when the agent needs its member
  async openConversation({
    workspaceId,
    sender,
    title,
    threadKey,
    fallbackThreadKey,
    recipientWorkspaceMemberId,
    fallbackRecipientWorkspaceMemberId = null,
  }: {
    workspaceId: string;
    sender: AgentInboxSender;
    title: string;
    threadKey: string;
    // where the run writes when the conversation its key names is unavailable
    fallbackThreadKey: string;
    recipientWorkspaceMemberId: string | null;
    // used without a recipient; a member who cannot have the conversation leaves it to no inbox
    fallbackRecipientWorkspaceMemberId?: string | null;
  }): Promise<
    | ({ status: 'OPENED' } & AgentRunConversation)
    // the recipient deleted both the conversation its key names and the fallback one
    | { status: 'DELETED' }
  > {
    const openThreadUnderKey = async (key: string) => {
      const openThread = (workspaceMemberIds: string[]) =>
        this.agentInboxService.openThread({
          workspaceId,
          sender,
          workspaceMemberIds,
          threadKey: key,
          title,
          isArchivedOnCreate: true,
        });

      if (
        isDefined(recipientWorkspaceMemberId) ||
        !isDefined(fallbackRecipientWorkspaceMemberId)
      ) {
        return openThread(
          isDefined(recipientWorkspaceMemberId)
            ? [recipientWorkspaceMemberId]
            : [],
        );
      }

      // a fallback recipient who cannot have the conversation, such as one who cannot use AI,
      // leaves a conversation no inbox receives
      try {
        return await openThread([fallbackRecipientWorkspaceMemberId]);
      } catch (error) {
        if (isThreadNotFoundError(error)) {
          return openThread([]);
        }

        throw error;
      }
    };

    // a recipient who cannot join the keyed conversation, such as one no inbox receives, is given
    // the fallback one, which fails in turn for a recipient who cannot have a conversation at all
    const keyedConversation = await openThreadUnderKey(threadKey).catch(
      (error: unknown) =>
        isThreadNotFoundError(error) ? null : Promise.reject(error),
    );

    // a conversation the recipient deleted is not written to again, and one already waiting on an answer
    // or holding a suspended run has no room for another, so this run starts its own
    const isKeyedConversationUnavailable =
      !isDefined(keyedConversation) ||
      isDefined(keyedConversation.thread.deletedAt) ||
      isDefined(keyedConversation.thread.pendingQuestionMessageId) ||
      (await this.agentRunSuspensionService.isConversationWaiting({
        workspaceId,
        threadId: keyedConversation.thread.id,
      }));
    const { thread, isCreated } = isKeyedConversationUnavailable
      ? await openThreadUnderKey(fallbackThreadKey)
      : keyedConversation;

    if (isDefined(thread.deletedAt)) {
      return { status: 'DELETED' };
    }

    return { status: 'OPENED', threadId: thread.id, isCreated };
  }

  async sendMessage({
    workspaceId,
    sender,
    message,
    fallbackThreadKey,
    awaitedToolCall,
  }: {
    workspaceId: string;
    sender: AgentInboxSender;
    message: Omit<SendInboxMessageInput, 'toolCall'>;
    // where the message goes when its recipient cannot join the conversation its key names
    fallbackThreadKey: string;
    awaitedToolCall?: AgentCallerAwaitedToolCall;
  }): Promise<
    | { status: 'DELIVERED'; threadId: string }
    // the member deleted the conversation, so the call can no longer be answered
    | { status: 'DISMISSED'; threadId: string }
    // the caller waits on the call with an ANSWER wake-up, which the answer resolves
    | { status: 'AWAITING'; threadId: string; toolCallId: string }
    // a message sent before already holds the answer
    | { status: 'ANSWERED'; threadId: string; answer: ProposedToolCallAnswer }
  > {
    // as in openConversation, a recipient who cannot join the keyed conversation, such as one no inbox
    // receives, is given the fallback one, which fails in turn for a recipient who cannot have one at all
    const sendInboxMessage = (
      args: Pick<
        Parameters<AgentInboxService['sendMessage']>[0],
        'input' | 'buildAwaitingToolCall'
      >,
    ) =>
      this.agentInboxService
        .sendMessage({ workspaceId, sender, ...args })
        .catch((error: unknown) =>
          isThreadNotFoundError(error)
            ? this.agentInboxService.sendMessage({
                workspaceId,
                sender,
                ...args,
                input: { ...args.input, threadKey: fallbackThreadKey },
              })
            : Promise.reject(error),
        );

    if (!isDefined(awaitedToolCall)) {
      const { threadId } = await sendInboxMessage({ input: message });

      return { status: 'DELIVERED', threadId };
    }

    // resolved once, and only when a message is written
    let pendingToolCall:
      | ReturnType<AgentCallerConversationService['buildPendingToolCall']>
      | undefined;
    const buildAwaitingToolCall = async (postedCall: {
      threadId: string;
      toolCallId: string;
    }) => {
      const awaitingToolCall = await (pendingToolCall ??=
        this.buildPendingToolCall({
          workspaceId,
          awaitedToolCall,
          summary: message.text,
        }));

      await awaitedToolCall.waitOnAnswer(postedCall);

      return awaitingToolCall;
    };

    // a message sent again finds the call it posted before: a pending one is still awaited, an answered
    // one is reused so nothing runs twice, and one closed unanswered, such as by a run that ended and
    // was retried, is asked again in a new message
    for (let attempt = 0; attempt < MAX_ASK_ATTEMPTS; attempt++) {
      const { threadId, toolCallId, isDismissed, awaitedToolOutput } =
        await sendInboxMessage({
          input: {
            ...message,
            idempotencyKey:
              attempt === 0
                ? message.idempotencyKey
                : `${message.idempotencyKey}:${attempt}`,
          },
          buildAwaitingToolCall,
        });

      if (isDismissed) {
        return { status: 'DISMISSED', threadId };
      }

      const status = readToolCallStatus(awaitedToolOutput);

      if (status === 'skipped') {
        continue;
      }

      if (status === 'pending' || status === 'running') {
        return { status: 'AWAITING', threadId, toolCallId };
      }

      const answer = readProposedToolCallAnswer(awaitedToolOutput);

      if (!isDefined(answer)) {
        throw new AiException(
          'The answer to the proposed call could not be read',
          AiExceptionCode.INVALID_TOOL_CALL_OUTPUT,
        );
      }

      return { status: 'ANSWERED', threadId, answer };
    }

    throw new AiException(
      `The action was asked ${MAX_ASK_ATTEMPTS} times without an answer`,
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  // resolved with the caller's permissions, the ones it acts with itself
  private async buildPendingToolCall({
    workspaceId,
    awaitedToolCall: { toolName, arguments: toolArguments, caller },
    summary,
  }: {
    workspaceId: string;
    awaitedToolCall: AgentCallerAwaitedToolCall;
    summary: string;
  }) {
    const { authContext, rolePermissionConfig, application } =
      await this.callerHandlerRegistry
        .getHandlerOrThrow(caller.type)
        .buildExecutionContext({ workspaceId, caller });

    const toolContext = {
      workspaceId,
      roleId: getRoleIdsFromRolePermissionConfig(rolePermissionConfig)[0] ?? '',
      rolePermissionConfig,
      authContext,
      application,
    } satisfies ToolContext;

    const catalog = await this.toolRegistryService.getCatalog(toolContext);
    const inputSchemas = await this.toolRegistryService.resolveSchemas({
      toolNames: [toolName],
      context: toolContext,
      precomputedCatalog: catalog,
    });
    const missingArgumentNames = findMissingRequiredToolArguments({
      inputSchema: inputSchemas.get(toolName),
      toolArguments,
    });

    if (missingArgumentNames.length > 0) {
      throw new AiException(
        `The action is missing required arguments: ${missingArgumentNames.join(', ')}`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const input = { toolName, arguments: toolArguments, summary };

    const resolution = await resolveProposedToolCall({
      input,
      findTool: async (catalogToolName) =>
        catalog.find((catalogEntry) => catalogEntry.name === catalogToolName),
      executeTool: ({ toolName: executedToolName, args }) =>
        this.toolRegistryService.resolveAndExecute(
          executedToolName,
          args,
          toolContext,
        ),
    });

    if ('error' in resolution) {
      throw new AiException(
        `The tool call cannot be proposed: ${resolution.error}`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return {
      toolName: PROPOSE_TOOL_CALL_TOOL_NAME,
      input,
      output: buildProposeToolCallPendingOutput(resolution.proposal),
    };
  }
}
