import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CoreMessage, streamText } from 'ai';
import { Response } from 'express';
import { Repository } from 'typeorm';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { ModelProvider } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { getAIModelById } from 'src/engine/core-modules/ai/utils/get-ai-model-by-id';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  AgentChatMessageEntity,
  AgentChatMessageRole,
} from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/agent/agent-chat-thread.entity';
import { AgentToolService } from 'src/engine/metadata-modules/agent/agent-tool.service';

import { AgentChatService } from './agent-chat.service';
import { AgentExecutionService } from './agent-execution.service';

import { AGENT_CONFIG } from './constants/agent-config.const';
import { AGENT_SYSTEM_PROMPTS } from './constants/agent-system-prompts.const';

@Controller('rest/agent-chat')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(RestApiExceptionFilter)
export class AgentChatController {
  constructor(
    private readonly agentChatService: AgentChatService,
    private readonly agentExecutionService: AgentExecutionService,
    @InjectRepository(AgentChatThreadEntity, 'core')
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    @InjectRepository(AgentChatMessageEntity, 'core')
    private readonly messageRepository: Repository<AgentChatMessageEntity>,
    private readonly agentToolService: AgentToolService,
  ) {}

  @Get('threads/:agentId')
  async getThreadsForAgent(@Param('agentId') agentId: string) {
    return this.agentChatService.getThreadsForAgent(agentId);
  }

  @Get('messages/:threadId')
  async getMessagesForThread(@Param('threadId') threadId: string) {
    return this.agentChatService.getMessagesForThread(threadId);
  }

  @Post('threads')
  async createThread(@Body() body: { agentId: string }) {
    return this.agentChatService.createThread(body.agentId);
  }

  @Post('messages')
  async sendMessage(@Body() body: { threadId: string; content: string }) {
    return this.agentChatService.addUserMessageAndAIResponse(
      body.threadId,
      body.content,
    );
  }

  @Post('stream')
  async streamAgentChat(
    @Body()
    body: { threadId: string; userMessage: string },
    @Res() res: Response,
  ) {
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
  }
}
