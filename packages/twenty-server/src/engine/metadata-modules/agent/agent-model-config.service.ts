import { Injectable } from '@nestjs/common';

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { ProviderOptions } from '@ai-sdk/provider-utils';
import { ToolSet } from 'ai';

import { ModelProvider } from 'src/engine/core-modules/ai/constants/ai-models.const';
import {
  AiModelRegistryService,
  RegisteredAIModel,
} from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/agent/constants/agent-config.const';

import { AgentEntity } from './agent.entity';

@Injectable()
export class AgentModelConfigService {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  getProviderOptions(
    model: RegisteredAIModel,
    agent: AgentEntity,
  ): ProviderOptions {
    switch (model.provider) {
      case ModelProvider.XAI:
        return this.getXaiProviderOptions(agent);
      case ModelProvider.ANTHROPIC:
        return this.getAnthropicProviderOptions(model);
      case ModelProvider.OPENAI:
      case ModelProvider.OPENAI_COMPATIBLE:
        return {};
      default:
        return {};
    }
  }

  getNativeModelTools(model: RegisteredAIModel, agent: AgentEntity): ToolSet {
    const tools: ToolSet = {};

    if (!agent.modelCofinguration) {
      return tools;
    }

    switch (model.provider) {
      case ModelProvider.ANTHROPIC:
        if (agent.modelCofinguration.webSearch?.enabled) {
          tools.web_search = anthropic.tools.webSearch_20250305();
        }
        break;
      case ModelProvider.OPENAI:
        if (agent.modelCofinguration.webSearch?.enabled) {
          tools.web_search = openai.tools.webSearch();
        }
        break;
    }

    return tools;
  }

  private getXaiProviderOptions(agent: AgentEntity): ProviderOptions {
    if (
      !agent.modelCofinguration.webSearch?.enabled &&
      !agent.modelCofinguration.twitterSearch?.enabled
    ) {
      return {};
    }

    const sources: Array<{ type: string }> = [];

    if (agent.modelCofinguration.webSearch?.enabled) {
      sources.push({ type: 'web' });
    }

    if (agent.modelCofinguration.twitterSearch?.enabled) {
      sources.push({ type: 'x' });
    }

    return {
      xai: {
        searchParameters: {
          mode: 'auto',
          ...(sources.length > 0 && { sources }),
        },
      },
    };
  }

  private getAnthropicProviderOptions(
    model: RegisteredAIModel,
  ): ProviderOptions {
    if (!model.doesSupportThinking) {
      return {};
    }

    return {
      anthropic: {
        thinking: {
          type: 'enabled',
          budgetTokens: AGENT_CONFIG.REASONING_BUDGET_TOKENS,
        },
      },
    };
  }
}
