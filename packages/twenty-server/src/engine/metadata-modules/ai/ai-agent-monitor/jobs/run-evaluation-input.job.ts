import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

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
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly aiAgentExecutorService: AgentAsyncExecutorService,
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

    const agent = await this.agentRepository.findOne({
      where: { id: data.agentId },
    });

    if (!agent) {
      throw new Error(`Agent ${data.agentId} not found`);
    }

    const executionResult = await this.aiAgentExecutorService.executeAgent({
      agent,
      userPrompt: data.input,
    });

    await this.agentChatService.addMessage({
      threadId: data.threadId,
      turnId: data.turnId,
      agentId: agent.id,
      uiMessage: {
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: JSON.stringify(executionResult.result) || '',
          },
        ],
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
}
