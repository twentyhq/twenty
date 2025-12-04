import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type TextPart, type ToolUIPart } from 'ai';
import { Repository } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { AgentExecutionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-execution.service';
import { AgentToolGeneratorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-tool-generator.service';
import { SimplifiedTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-snapshot.type';
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
    await this.agentChatService.addMessage({
      threadId: data.threadId,
      turnId: data.turnId,
      uiMessage: {
        role: 'user',
        parts: [{ type: 'text', text: data.input }],
      },
    });

    const agent = await this.agentService.findOneAgentById({
      id: data.agentId,
      workspaceId: data.workspaceId,
    });

    const { flatRoleTargetByAgentIdMaps } =
      await this.workspaceCacheService.getOrRecompute(data.workspaceId, [
        'flatRoleTargetByAgentIdMaps',
      ]);

    const roleId = flatRoleTargetByAgentIdMaps[data.agentId]?.roleId;
    const roleIds = roleId ? [roleId] : undefined;

    const toolSet = await this.agentToolGeneratorService.generateToolsForAgent(
      data.agentId,
      data.workspaceId,
      undefined,
      roleIds,
    );

    const simplifiedTools: Record<string, SimplifiedTool> = {};

    for (const [name, tool] of Object.entries(toolSet)) {
      const parameters = this.extractToolParameterNames(tool);

      simplifiedTools[name] = {
        description: tool.description,
        parameters: parameters.length > 0 ? parameters : undefined,
      };
    }

    await this.turnRepository.update(data.turnId, {
      executionSnapshot: {
        agentName: agent.name,
        agentDescription: agent.description ?? null,
        systemPrompt: agent.prompt,
        availableTools: simplifiedTools,
      },
    });

    const executionResult = await this.agentExecutionService.executeAgent({
      agentId: data.agentId,
      workspaceId: data.workspaceId,
      userPrompt: data.input,
    });

    const messageParts: (TextPart | ToolUIPart)[] = [];

    if (executionResult.toolCalls && executionResult.toolResults) {
      for (const toolCall of executionResult.toolCalls) {
        const toolResult = executionResult.toolResults.find(
          (tr) => tr.toolCallId === toolCall.toolCallId,
        );

        const toolInput =
          'args' in toolCall
            ? (toolCall as { args: unknown }).args
            : 'input' in toolCall
              ? (toolCall as { input: unknown }).input
              : undefined;

        const toolOutput =
          toolResult && 'result' in toolResult
            ? (toolResult as { result: unknown }).result
            : toolResult && 'output' in toolResult
              ? (toolResult as { output: unknown }).output
              : undefined;

        const isError =
          toolResult && 'isError' in toolResult && toolResult.isError;

        const basePart = {
          type: `tool-${toolCall.toolName}` as `tool-${string}`,
          toolCallId: toolCall.toolCallId,
          input: toolInput,
        };

        messageParts.push(
          isError
            ? {
                ...basePart,
                errorText: String(toolOutput),
                state: 'output-error',
              }
            : {
                ...basePart,
                output: toolOutput,
                state: 'output-available',
              },
        );
      }
    }

    messageParts.push({
      type: 'text',
      text: JSON.stringify(executionResult.result) || '',
    });

    await this.agentChatService.addMessage({
      threadId: data.threadId,
      turnId: data.turnId,
      agentId: data.agentId,
      uiMessage: {
        role: 'assistant',
        parts: messageParts,
      },
    });

    await this.messageQueueService.add<{
      turnId: string;
      workspaceId: string;
    }>(EvaluateAgentTurnJob.name, {
      turnId: data.turnId,
      workspaceId: data.workspaceId,
    });
  }

  private extractToolParameterNames(tool: unknown): string[] {
    if (!tool || typeof tool !== 'object') return [];

    const toolObj = tool as Record<string, unknown>;

    const inputSchema = toolObj.inputSchema as
      | Record<string, unknown>
      | undefined;

    if (inputSchema?.properties && typeof inputSchema.properties === 'object') {
      return Object.keys(inputSchema.properties);
    }

    const parameters = toolObj.parameters as
      | Record<string, unknown>
      | undefined;

    if (parameters?.properties && typeof parameters.properties === 'object') {
      return Object.keys(parameters.properties);
    }

    return [];
  }
}
