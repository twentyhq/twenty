import { Injectable } from '@nestjs/common';

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';

import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

import { convertOutputSchemaToZod } from './utils/convert-output-schema-to-zod';

export interface AgentExecutionResult {
  object: object;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

type ModelProvider = 'openai' | 'anthropic';

@Injectable()
export class AgentExecutionService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  private getModel = (modelId: string, provider: ModelProvider) => {
    switch (provider) {
      case 'openai':
        return openai(modelId);
      case 'anthropic':
        return anthropic(modelId);
      default:
        throw new AgentException(
          `Unsupported provider: ${provider}`,
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
    }
  };

  private async validateApiKey(provider: ModelProvider): Promise<void> {
    let apiKey: string | undefined;

    switch (provider) {
      case 'openai':
        apiKey = this.twentyConfigService.get('OPENAI_API_KEY');
        break;
      case 'anthropic':
        apiKey = this.twentyConfigService.get('ANTHROPIC_API_KEY');
        break;
      default:
        throw new AgentException(
          `Unsupported provider: ${provider}`,
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
    }

    if (!apiKey) {
      throw new AgentException(
        `${provider.toUpperCase()} API key not configured`,
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }
  }

  async executeAgent({
    agent,
    context,
    schema,
  }: {
    agent: AgentEntity;
    context: Record<string, unknown>;
    schema: OutputSchema;
  }): Promise<AgentExecutionResult> {
    try {
      const provider = agent.aiModel.provider;

      await this.validateApiKey(provider);

      const output = await generateObject({
        model: this.getModel(agent.modelId, provider),
        prompt: resolveInput(agent.prompt, context) as string,
        schema: convertOutputSchemaToZod(schema),
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
