import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { generateText } from 'ai';
import { Repository } from 'typeorm';

import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { AgentTurnEvaluationEntity } from 'src/engine/metadata-modules/ai/ai-agent-monitor/entities/agent-turn-evaluation.entity';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

@Injectable()
export class AgentTurnGraderService {
  private readonly logger = new Logger(AgentTurnGraderService.name);

  constructor(
    @InjectRepository(AgentTurnEntity)
    private readonly turnRepository: Repository<AgentTurnEntity>,
    @InjectRepository(AgentTurnEvaluationEntity)
    private readonly evaluationRepository: Repository<AgentTurnEvaluationEntity>,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  async evaluateTurn(turnId: string): Promise<AgentTurnEvaluationEntity> {
    const turn = await this.turnRepository.findOne({
      where: { id: turnId },
      relations: ['messages', 'messages.parts', 'agent'],
    });

    if (!turn) {
      throw new Error(`Turn ${turnId} not found`);
    }

    const { score, comment } = await this.evaluateWithAI(turn);

    const evaluation = this.evaluationRepository.create({
      turnId,
      score,
      comment,
    });

    return this.evaluationRepository.save(evaluation);
  }

  private async evaluateWithAI(
    turn: AgentTurnEntity & { messages: AgentMessageEntity[] },
  ): Promise<{ score: number; comment: string }> {
    try {
      const defaultModel = this.aiModelRegistryService.getDefaultSpeedModel();

      if (!defaultModel) {
        this.logger.warn('No default AI model available for evaluation');

        return this.getFallbackEvaluation(turn);
      }

      const agentContext = this.buildAgentContext(turn.agent);
      const evaluationContext = this.buildEvaluationContext(turn);

      const prompt = `You are evaluating an AI agent's performance on a single turn (user request + agent response).

${agentContext}

${evaluationContext}

Evaluate this agent turn based on:
1. **Following Instructions**: Did the agent follow its system prompt and intended behavior?
2. **Task Completion**: Did the agent accomplish what the user asked?
3. **Tool Usage**: Were the configured tools used correctly and appropriately?
4. **Response Quality**: Is the response clear, accurate, and helpful?
5. **Error Handling**: Were errors handled gracefully?

Provide:
- A score from 0 to 100 (0 = complete failure, 100 = perfect)
- A brief comment explaining the score (max 200 characters)

Respond ONLY with valid JSON in this exact format:
{"score": <number>, "comment": "<string>"}`;

      const result = await generateText({
        model: defaultModel.model,
        prompt,
        temperature: 0.3,
        experimental_telemetry: AI_TELEMETRY_CONFIG,
      });

      const parsed = JSON.parse(result.text);

      return {
        score: Math.max(0, Math.min(100, Math.round(parsed.score))),
        comment: (parsed.comment || 'Evaluation completed').substring(0, 500),
      };
    } catch (error) {
      this.logger.error('Failed to evaluate turn with AI:', error);

      return this.getFallbackEvaluation(turn);
    }
  }

  private buildAgentContext(agent: AgentEntity | null): string {
    if (!agent) {
      return '**Agent Configuration:** No agent configuration available\n';
    }

    let context = '**Agent Configuration:**\n';

    if (agent.name) {
      context += `- Agent Name: ${agent.name}\n`;
    }

    if (agent.description) {
      context += `- Agent Purpose: ${agent.description}\n`;
    }

    if (agent.prompt) {
      const promptPreview =
        agent.prompt.length > 500
          ? agent.prompt.substring(0, 500) + '...'
          : agent.prompt;

      context += `- System Prompt/Instructions:\n${promptPreview}\n`;
    }

    if (agent.modelConfiguration) {
      const configDetails = [];

      if (agent.modelConfiguration.webSearch?.enabled) {
        configDetails.push('Web Search');
      }

      if (configDetails.length > 0) {
        context += `- Native Tools Enabled: ${configDetails.join(', ')}\n`;
      }
    }

    return context + '\n';
  }

  private buildEvaluationContext(
    turn: AgentTurnEntity & { messages: AgentMessageEntity[] },
  ): string {
    const userMessages = turn.messages.filter((m) => m.role === 'user');
    const assistantMessages = turn.messages.filter(
      (m) => m.role === 'assistant',
    );

    const userText = userMessages
      .flatMap((m) => m.parts || [])
      .filter((p) => p.textContent)
      .map((p) => p.textContent)
      .join('\n');

    const assistantParts = assistantMessages.flatMap((m) => m.parts || []);

    const assistantText = assistantParts
      .filter((p) => p.textContent)
      .map((p) => p.textContent)
      .join('\n');

    const toolCalls = assistantParts
      .filter((p) => p.toolName)
      .map((p) => ({
        tool: p.toolName,
        hasError: !!p.errorMessage,
        error: p.errorMessage,
      }));

    const errors = assistantParts
      .filter((p) => p.errorMessage)
      .map((p) => p.errorMessage);

    let context = `**User Request:**\n${userText || '(no text)'}\n\n`;

    context += `**Agent Response:**\n${assistantText || '(no text response)'}\n\n`;

    if (toolCalls.length > 0) {
      context += `**Tools Used:**\n${toolCalls.map((t) => `- ${t.tool}${t.hasError ? ' (FAILED)' : ''}`).join('\n')}\n\n`;
    }

    if (errors.length > 0) {
      context += `**Errors:**\n${errors.map((e) => `- ${e}`).join('\n')}\n\n`;
    }

    return context;
  }

  private getFallbackEvaluation(
    turn: AgentTurnEntity & { messages: AgentMessageEntity[] },
  ): {
    score: number;
    comment: string;
  } {
    const parts = turn.messages.flatMap((m) => m.parts || []);
    const errorCount = parts.filter((p) => p.errorMessage).length;
    const hasResponse = parts.some((p) => p.textContent);
    const toolCount = parts.filter((p) => p.toolName).length;

    let score = 100;

    if (errorCount > 0) {
      score -= errorCount * 30;
    }

    if (!hasResponse) {
      score -= 50;
    }

    const comments = [];

    if (errorCount > 0) {
      comments.push(`${errorCount} error(s)`);
    }
    if (toolCount > 0) {
      comments.push(`${toolCount} tool(s) used`);
    }
    if (!hasResponse) {
      comments.push('No response');
    }

    return {
      score: Math.max(0, score),
      comment: comments.length > 0 ? comments.join('; ') : 'Completed',
    };
  }
}
