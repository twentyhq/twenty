import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { Repository } from 'typeorm';
import { z } from 'zod';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

import { inferZodSchemaFromExample } from './utils/infer-zod-schema-from-example.util';

@Injectable()
export class AgentExecutionService {
  constructor(
    @InjectRepository(AgentEntity, 'core')
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  private getModelConfig(model: string): {
    provider: 'openai' | 'anthropic';
    modelId: string;
  } {
    if (model.startsWith('gpt-')) {
      return { provider: 'openai', modelId: model };
    }
    if (model.startsWith('claude-')) {
      return { provider: 'anthropic', modelId: model };
    }

    throw new AgentException(
      `Unsupported model: ${model}`,
      AgentExceptionCode.UNSUPPORTED_MODEL,
    );
  }

  private getModel = (modelName: string) => {
    if (modelName.startsWith('gpt-')) {
      return openai(modelName);
    }
    if (modelName.startsWith('claude-')) {
      return anthropic(modelName);
    }

    throw new Error(`Unsupported model: ${modelName}`);
  };

  private async validateApiKey(
    provider: 'openai' | 'anthropic',
  ): Promise<void> {
    const apiKey = this.twentyConfigService.get(
      provider === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY',
    );

    if (!apiKey) {
      throw new AgentException(
        `${provider.toUpperCase()} API key not configured`,
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }
  }

  async executeAgent(
    agent: AgentEntity,
  ): Promise<{ output: unknown; duration: number }> {
    try {
      const { provider } = this.getModelConfig(agent.model);

      await this.validateApiKey(provider);

      let schema: z.ZodType;

      try {
        schema = inferZodSchemaFromExample(JSON.parse(agent.responseFormat));
      } catch (error) {
        throw new AgentException(
          `Invalid response format schema: ${error instanceof Error ? error.message : 'Unknown error'}`,
          AgentExceptionCode.AGENT_INVALID_PROMPT,
        );
      }

      const output = await generateObject({
        model: this.getModel(agent.model),
        prompt: agent.prompt,
        schema,
      });

      return output.object;
    } catch (error) {
      if (error instanceof AgentException) {
        throw error;
      }

      throw new AgentException(
        error instanceof Error ? error.message : 'Agent execution failed',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }
  }
}
