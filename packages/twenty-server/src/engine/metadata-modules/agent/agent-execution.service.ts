import { Injectable } from '@nestjs/common';

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';

import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

import { inferZodSchemaFromExampleResponse } from './utils/infer-zod-schema-from-example-response.util';

@Injectable()
export class AgentExecutionService {
  constructor() {}

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
    const apiKey =
      process.env[
        provider === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY'
      ];

    if (!apiKey) {
      throw new AgentException(
        `${provider.toUpperCase()} API key not configured`,
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }
  }

  async executeAgent(
    agent: AgentEntity,
    context: Record<string, unknown>,
  ): Promise<{ output: unknown; duration: number }> {
    try {
      const { provider } = this.getModelConfig(agent.model);

      await this.validateApiKey(provider);

      let schema: z.ZodType;

      try {
        schema = inferZodSchemaFromExampleResponse(
          JSON.parse(agent.responseFormat),
        );
      } catch (error) {
        throw new AgentException(
          `Invalid response format schema: ${error instanceof Error ? error.message : 'Unknown error'}`,
          AgentExceptionCode.AGENT_INVALID_PROMPT,
        );
      }

      const output = await generateObject({
        model: this.getModel(agent.model),
        prompt: resolveInput(agent.prompt, context) as string,
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
