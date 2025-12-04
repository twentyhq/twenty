import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { generateText } from 'ai';
import { Repository } from 'typeorm';

import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { AgentExecutionSnapshot } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-snapshot.type';
import { AgentTurnEvaluationEntity } from 'src/engine/metadata-modules/ai/ai-agent-monitor/entities/agent-turn-evaluation.entity';
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

      let agentContextString = '';

      if (turn.executionSnapshot) {
        agentContextString = this.buildAgentContext(turn.executionSnapshot);
      }

      const evaluationContext = this.buildEvaluationContext(turn);

      const prompt = `You are evaluating an AI agent's performance on a single turn (user request + agent response).

${agentContextString}

${evaluationContext}

Evaluate the agent's overall performance on this turn.

You have the Available Tools list above - use this to objectively assess if the agent took appropriate action when needed.

**Evaluate:**

1. **Following Instructions**: Did the agent follow its system prompt and intended behavior?

2. **Task Accomplishment**: Did the agent successfully complete what the user requested?
   - If user requested an action but agent only described what to do: This is a failure
   - Check if appropriate tools from the available list were used

3. **Execution Quality**: How well did the agent execute?
   - Were appropriate tools selected?
   - Were tools used with proper parameters?
   - Do outputs show successful work?

4. **Response Quality**: Is the response clear, accurate, and helpful?

**Key Consideration:**
If the user requested something actionable and the agent had relevant tools available but didn't use them, this indicates failure to execute properly.

Provide:
- A score from 0 to 100 based on overall agent performance (0 = complete failure, 100 = perfect)
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

  private buildAgentContext(snapshot: AgentExecutionSnapshot): string {
    let context = '**Agent Configuration:**\n';

    context += `- Agent Name: ${snapshot.agentName}\n`;

    if (snapshot.agentDescription) {
      context += `- Agent Purpose: ${snapshot.agentDescription}\n`;
    }

    const promptPreview =
      snapshot.systemPrompt.length > 500
        ? snapshot.systemPrompt.substring(0, 500) + '...'
        : snapshot.systemPrompt;

    context += `- System Prompt/Instructions:\n${promptPreview}\n`;

    context +=
      '\n' + this.formatToolsForEvaluation(snapshot.availableTools) + '\n';

    return context;
  }

  private formatToolsForEvaluation(
    tools: Record<string, { description?: string }>,
  ): string {
    if (!tools || Object.keys(tools).length === 0) {
      return '**Available Tools:** None';
    }

    let formatted = '**Available Tools:**\n';

    Object.entries(tools).forEach(([name, tool]) => {
      formatted += `- ${name}`;

      if (tool.description) {
        formatted += `: ${tool.description}`;
      }

      formatted += '\n';
    });

    return formatted;
  }

  private buildEvaluationContext(
    turn: AgentTurnEntity & { messages: AgentMessageEntity[] },
  ): string {
    const userText = this.extractUserRequest(turn.messages);
    const assistantParts = this.getAssistantParts(turn.messages);
    const assistantText = this.extractAssistantText(assistantParts);
    const toolExecutionDetails = this.buildToolExecutionSection(assistantParts);

    return [
      `**User Request:**\n${userText || '(no text)'}\n`,
      toolExecutionDetails,
      `**Agent Response:**\n${assistantText || '(no text response)'}\n`,
    ].join('\n');
  }

  private extractUserRequest(messages: AgentMessageEntity[]): string {
    return messages
      .filter((m) => m.role === 'user')
      .flatMap((m) => m.parts || [])
      .filter((p) => p.textContent)
      .map((p) => p.textContent)
      .join('\n');
  }

  private getAssistantParts(messages: AgentMessageEntity[]) {
    return messages
      .filter((m) => m.role === 'assistant')
      .flatMap((m) => m.parts || []);
  }

  private extractAssistantText(parts: AgentMessageEntity['parts']): string {
    return parts
      .filter((p) => p.textContent)
      .map((p) => p.textContent)
      .join('\n');
  }

  private buildToolExecutionSection(
    assistantParts: AgentMessageEntity['parts'],
  ): string {
    const toolParts = assistantParts.filter((p) => p.type.includes('tool-'));

    if (toolParts.length === 0) {
      return '**Tool Execution Details:**\nNo tools were called\n';
    }

    let section = '**Tool Execution Details:**\n\n';

    toolParts.forEach((toolPart, idx) => {
      const status =
        toolPart.errorMessage || toolPart.state === 'output-error'
          ? 'FAILED'
          : 'SUCCESS';

      section += `${idx + 1}. ${toolPart.toolName} (${status})\n`;

      if (toolPart.toolInput) {
        section += this.formatJsonField('Input', toolPart.toolInput);
      }

      if (toolPart.toolOutput) {
        section += this.formatJsonField('Output', toolPart.toolOutput);
      }

      if (toolPart.errorMessage) {
        section += `   Error: ${toolPart.errorMessage}\n`;
      }

      section += '\n';
    });

    return section;
  }

  private formatJsonField(label: string, value: unknown): string {
    const jsonStr = JSON.stringify(value, null, 2);
    const truncated =
      jsonStr.length > 300 ? jsonStr.substring(0, 300) + '...' : jsonStr;

    return `   ${label}:\n${truncated}\n`;
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
