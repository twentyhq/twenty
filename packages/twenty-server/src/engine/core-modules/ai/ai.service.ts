import { Inject, Injectable } from '@nestjs/common';

import {
  CoreMessage,
  StreamTextResult,
  Tool,
  ToolChoice,
  jsonSchema,
} from 'ai';

import { AiDriver } from 'src/engine/core-modules/ai/drivers/interfaces/ai-driver.interface';

import { AI_DRIVER } from 'src/engine/core-modules/ai/ai.constants';

// OpenAI-compatible interfaces
export interface ChatCompletionTool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
}

export type ChatCompletionToolChoiceOption =
  | 'auto'
  | 'none'
  | 'required'
  | {
      type: 'function';
      function: {
        name: string;
      };
    };

export interface ChatCompletionRequest {
  messages: CoreMessage[];
  temperature?: number;
  max_tokens?: number;
  tools?: ChatCompletionTool[];
  tool_choice?: ChatCompletionToolChoiceOption;
}

@Injectable()
export class AiService {
  constructor(@Inject(AI_DRIVER) private driver: AiDriver) {}

  streamText(
    messages: CoreMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      tools?: Record<string, Tool>;
      toolChoice?: ToolChoice<Record<string, Tool>>;
    },
  ): StreamTextResult<Record<string, Tool>, undefined> {
    return this.driver.streamText(messages, options);
  }

  convertOpenAICompatibleToolsToAISDK(
    openAITools?: ChatCompletionTool[],
  ): Record<string, Tool> | undefined {
    if (!openAITools || !Array.isArray(openAITools)) {
      return undefined;
    }

    const aiSDKTools: Record<string, Tool> = {};

    for (const tool of openAITools) {
      if (tool.type === 'function' && tool.function) {
        const functionName = tool.function.name;

        // Convert OpenAI-compatible JSON schema parameters to AI SDK format
        let parameters;

        if (tool.function.parameters) {
          // If parameters exist, wrap them in jsonSchema to ensure proper handling
          parameters = jsonSchema(tool.function.parameters);
        } else {
          // Default empty object schema if no parameters provided
          parameters = jsonSchema({
            type: 'object',
            properties: {},
          });
        }

        // Create tool without execute function to allow client-side handling
        // This is important for tools like BlockNote that need to handle operations on the frontend
        aiSDKTools[functionName] = {
          description: tool.function.description || '',
          parameters,
          // No execute function - tools will be handled client-side
        };
      }
    }

    return Object.keys(aiSDKTools).length > 0 ? aiSDKTools : undefined;
  }

  convertOpenAICompatibleToolChoiceToAISDK(
    toolChoice?: ChatCompletionToolChoiceOption,
  ): ToolChoice<Record<string, Tool>> | undefined {
    if (!toolChoice) {
      return undefined;
    }

    if (typeof toolChoice === 'string') {
      if (toolChoice === 'required') {
        return 'required';
      }
      if (toolChoice === 'auto') {
        return 'auto';
      }
      if (toolChoice === 'none') {
        return 'none';
      }
    }

    if (
      typeof toolChoice === 'object' &&
      toolChoice.type === 'function' &&
      toolChoice.function?.name
    ) {
      return {
        type: 'tool',
        toolName: toolChoice.function.name,
      };
    }

    return undefined;
  }
}
