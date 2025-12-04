import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type TextPart, type ToolSet, type ToolUIPart } from 'ai';
import { Repository } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { AgentExecutionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-execution.service';
import { AgentToolGeneratorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-tool-generator.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentExecutionSnapshot } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-snapshot.type';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

import { EvaluateAgentTurnJob } from './evaluate-agent-turn.job';

export type RunEvaluationInputJobData = {
  turnId: string;
  threadId: string;
  agentId: string;
  input: string;
  workspaceId: string;
};

@Processor(MessageQueue.aiQueue)
export class RunEvaluationInputJob {
  private readonly logger = new Logger(RunEvaluationInputJob.name);

  constructor(
    @InjectRepository(AgentTurnEntity)
    private readonly turnRepository: Repository<AgentTurnEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly agentExecutionService: AgentExecutionService,
    private readonly agentService: AgentService,
    private readonly agentToolGeneratorService: AgentToolGeneratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(RunEvaluationInputJob.name)
  async handle(data: RunEvaluationInputJobData): Promise<void> {
    await this.addUserMessage(data);

    const snapshot = await this.createExecutionSnapshot(
      data.agentId,
      data.workspaceId,
    );

    await this.saveSnapshot(data.turnId, snapshot);

    const executionResult = await this.agentExecutionService.executeAgent({
      agentId: data.agentId,
      workspaceId: data.workspaceId,
      userPrompt: data.input,
    });

    const messageParts = this.buildMessageParts(executionResult);

    await this.saveAssistantResponse(data, messageParts);
    await this.queueEvaluation(data.turnId, data.workspaceId);
  }

  private async addUserMessage(data: RunEvaluationInputJobData): Promise<void> {
    await this.agentChatService.addMessage({
      threadId: data.threadId,
      turnId: data.turnId,
      uiMessage: {
        role: 'user',
        parts: [{ type: 'text', text: data.input }],
      },
    });
  }

  private async createExecutionSnapshot(
    agentId: string,
    workspaceId: string,
  ): Promise<AgentExecutionSnapshot> {
    const agent = await this.agentService.findOneAgentById({
      id: agentId,
      workspaceId,
    });

    const roleIds = await this.getRoleIdsForAgent(agentId, workspaceId);
    const toolSet = await this.agentToolGeneratorService.generateToolsForAgent(
      agentId,
      workspaceId,
      undefined,
      roleIds,
    );

    return {
      agentName: agent.name,
      agentDescription: agent.description ?? null,
      systemPrompt: agent.prompt,
      availableTools: this.simplifyTools(toolSet),
    };
  }

  private async getRoleIdsForAgent(
    agentId: string,
    workspaceId: string,
  ): Promise<string[] | undefined> {
    const { flatRoleTargetByAgentIdMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleTargetByAgentIdMaps',
      ]);

    const roleId = flatRoleTargetByAgentIdMaps[agentId]?.roleId;

    return roleId ? [roleId] : undefined;
  }

  private simplifyTools(
    toolSet: ToolSet,
  ): Record<string, { description?: string }> {
    const simplified: Record<string, { description?: string }> = {};

    for (const [name, tool] of Object.entries(toolSet)) {
      simplified[name] = {
        description:
          tool && typeof tool === 'object' && 'description' in tool
            ? (tool.description as string | undefined)
            : undefined,
      };
    }

    return simplified;
  }

  private async saveSnapshot(
    turnId: string,
    snapshot: AgentExecutionSnapshot,
  ): Promise<void> {
    await this.turnRepository.update(turnId, {
      executionSnapshot: snapshot,
    });
  }

  private buildMessageParts(
    executionResult: AgentExecutionResult,
  ): (TextPart | ToolUIPart)[] {
    const parts: (TextPart | ToolUIPart)[] = [];

    if (executionResult.toolCalls && executionResult.toolResults) {
      this.addToolExecutionParts(
        parts,
        executionResult.toolCalls,
        executionResult.toolResults,
      );
    }

    parts.push({
      type: 'text',
      text: JSON.stringify(executionResult.result) || '',
    });

    return parts;
  }

  private addToolExecutionParts(
    parts: (TextPart | ToolUIPart)[],
    toolCalls: AgentExecutionResult['toolCalls'],
    toolResults: AgentExecutionResult['toolResults'],
  ): void {
    if (!toolCalls || !toolResults) return;

    for (const toolCall of toolCalls) {
      const toolResult = toolResults.find(
        (tr) => tr.toolCallId === toolCall.toolCallId,
      );

      const toolInput = this.extractToolInput(toolCall);
      const toolOutput = this.extractToolOutput(toolResult);
      const isError = this.isToolError(toolResult);

      const basePart = {
        type: `tool-${toolCall.toolName}` as `tool-${string}`,
        toolCallId: toolCall.toolCallId,
        input: toolInput,
      };

      parts.push(
        isError
          ? {
              ...basePart,
              errorText: String(toolOutput),
              state: 'output-error',
            }
          : { ...basePart, output: toolOutput, state: 'output-available' },
      );
    }
  }

  private extractToolInput(toolCall: unknown): unknown {
    return 'args' in (toolCall as object)
      ? (toolCall as { args: unknown }).args
      : 'input' in (toolCall as object)
        ? (toolCall as { input: unknown }).input
        : undefined;
  }

  private extractToolOutput(toolResult: unknown): unknown {
    if (!toolResult) return undefined;

    return 'result' in (toolResult as object)
      ? (toolResult as { result: unknown }).result
      : 'output' in (toolResult as object)
        ? (toolResult as { output: unknown }).output
        : undefined;
  }

  private isToolError(toolResult: unknown): boolean {
    return (
      !!toolResult &&
      'isError' in (toolResult as object) &&
      !!(toolResult as { isError: boolean }).isError
    );
  }

  private async saveAssistantResponse(
    data: RunEvaluationInputJobData,
    messageParts: (TextPart | ToolUIPart)[],
  ): Promise<void> {
    await this.agentChatService.addMessage({
      threadId: data.threadId,
      turnId: data.turnId,
      agentId: data.agentId,
      uiMessage: {
        role: 'assistant',
        parts: messageParts,
      },
    });
  }

  private async queueEvaluation(
    turnId: string,
    workspaceId: string,
  ): Promise<void> {
    await this.messageQueueService.add<{
      turnId: string;
      workspaceId: string;
    }>(EvaluateAgentTurnJob.name, {
      turnId,
      workspaceId,
    });
  }
}
