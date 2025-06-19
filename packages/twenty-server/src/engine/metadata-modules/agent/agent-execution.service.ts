import { Injectable } from '@nestjs/common';

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';

import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

import { inferZodSchemaFromExampleResponse } from './utils/infer-zod-schema-from-example-response.util';

export interface AgentExecutionResult {
  object: object;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

@Injectable()
export class AgentExecutionService {
  constructor() {}

  private getModel = (modelId: string, provider: 'openai' | 'anthropic') => {
    switch (provider) {
      case 'openai':
        return openai(modelId);
      case 'anthropic':
        return anthropic(modelId);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
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
  ): Promise<AgentExecutionResult> {
    try {
      const provider = agent.aiModel.provider;

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
        model: this.getModel(agent.modelId, provider),
        prompt: resolveInput(agent.prompt, context) as string,
        schema,
      });

      return {
        object: output.object,
        usage: {
          promptTokens: output.usage?.promptTokens ?? 0,
          completionTokens: output.usage?.completionTokens ?? 0,
          totalTokens: output.usage?.totalTokens,
        },
      };
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
