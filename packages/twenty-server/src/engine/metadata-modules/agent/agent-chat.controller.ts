import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import console from 'console';

import { CoreMessage, streamText } from 'ai';
import { Response } from 'express';
import { Repository } from 'typeorm';

import { ModelProvider } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { getAIModelById } from 'src/engine/core-modules/ai/utils/get-ai-model-by-id';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { AgentChatMessageRole } from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/agent/agent-chat-thread.entity';
import { AgentToolService } from 'src/engine/metadata-modules/agent/agent-tool.service';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';

import { AgentChatService } from './agent-chat.service';
import { AgentExecutionService } from './agent-execution.service';
import { AgentService } from './agent.service';

import { AGENT_CONFIG } from './constants/agent-config.const';
import { AGENT_SYSTEM_PROMPTS } from './constants/agent-system-prompts.const';

@Controller('rest/agent-chat/stream')
export class AgentChatController {
  constructor(
    private readonly agentChatService: AgentChatService,
    private readonly agentExecutionService: AgentExecutionService,
    private readonly agentService: AgentService,
    @InjectRepository(AgentEntity, 'core')
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(AgentChatThreadEntity, 'core')
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    private readonly agentToolService: AgentToolService,
  ) {}

  @Post()
  @UseGuards(UserAuthGuard)
  async streamAgentChat(
    @Body()
    body: { agentId: string; threadId: string; userMessage: string },
    @Res() res: Response,
  ) {
    try {
      const { threadId, userMessage } = body;

      const thread = await this.threadRepository.findOneOrFail({
        where: { id: threadId },
        relations: ['messages', 'agent'],
      });

      await this.agentChatService.addMessage({
        threadId,
        role: AgentChatMessageRole.USER,
        content: userMessage,
      });

      const aiModel = getAIModelById(thread.agent.modelId);
      const provider = aiModel?.provider as ModelProvider;
      const llmMessages: CoreMessage[] = thread.messages.map(
        ({ role, content }) => ({
          role,
          content,
        }),
      );

      llmMessages.push({ role: 'user', content: userMessage });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');

      const tools = await this.agentToolService.generateToolsForAgent(
        thread.agent.id,
        thread.agent.workspaceId,
      );

      let aiTextResponse = '';

      const { textStream } = streamText({
        system: AGENT_SYSTEM_PROMPTS.AGENT_CHAT,
        model: this.agentExecutionService.getModel(
          thread.agent.modelId,
          provider,
        ),
        messages: llmMessages,
        maxSteps: AGENT_CONFIG.MAX_STEPS,
        tools,
      });

      for await (const chunk of textStream) {
        aiTextResponse += chunk;
        res.write(chunk);
      }

      await this.agentChatService.addMessage({
        threadId,
        role: AgentChatMessageRole.ASSISTANT,
        content: aiTextResponse,
      });

      res.end();
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal server error');
    }
  }
}
