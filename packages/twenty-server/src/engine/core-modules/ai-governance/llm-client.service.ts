import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  AIUsageLogEntity,
  ModelConfigEntity,
  AIProvider,
} from './ai-governance.entity';

export type LLMProvider = 'openai' | 'anthropic' | 'google';

export interface LLMRequest {
  provider: LLMProvider;
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface LLMResponse {
  content: string;
  tokensUsed: { input: number; output: number };
  cost: number;
  latencyMs: number;
}

// Cost per 1M tokens (USD)
const COST_TABLE: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 2.5, output: 10.0 },
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  'gemini-2.5-pro': { input: 1.25, output: 5.0 },
};

@Injectable()
export class LLMClientService {
  private readonly logger = new Logger(LLMClientService.name);

  constructor(
    @InjectRepository(ModelConfigEntity)
    private readonly modelConfigRepo: Repository<ModelConfigEntity>,
    @InjectRepository(AIUsageLogEntity)
    private readonly usageLogRepo: Repository<AIUsageLogEntity>,
  ) {}

  async getApiKey(
    workspaceId: string,
    provider: LLMProvider,
    model: string,
  ): Promise<string | null> {
    const config = await this.modelConfigRepo.findOne({
      where: {
        workspaceId,
        provider: provider as unknown as AIProvider,
        modelId: model,
        isEnabled: true,
      },
    });

    if (!config?.apiKey) {
      // Fallback: check environment variables
      const envKeyMap: Record<LLMProvider, string> = {
        openai: 'OPENAI_API_KEY',
        anthropic: 'ANTHROPIC_API_KEY',
        google: 'GOOGLE_AI_API_KEY',
      };

      return process.env[envKeyMap[provider]] ?? null;
    }

    return config.apiKey;
  }

  async call(
    request: LLMRequest,
    apiKey: string,
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const response = await this.callProvider(request, apiKey);
      const latencyMs = Date.now() - startTime;

      const cost = this.calculateCost(
        request.model,
        response.tokensUsed.input,
        response.tokensUsed.output,
      );

      return {
        content: response.content,
        tokensUsed: response.tokensUsed,
        cost,
        latencyMs,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown LLM error';

      this.logger.error(
        `LLM call failed [${request.provider}/${request.model}]: ${errorMessage}`,
      );

      throw new Error(`LLM call failed: ${errorMessage}`);
    }
  }

  async callAndLog(
    workspaceId: string,
    userId: string,
    feature: string,
    request: LLMRequest,
    apiKey: string,
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const response = await this.call(request, apiKey);

      await this.logUsage(workspaceId, userId, feature, request, response, true);

      return response;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown LLM error';

      await this.logUsage(
        workspaceId,
        userId,
        feature,
        request,
        {
          content: '',
          tokensUsed: { input: 0, output: 0 },
          cost: 0,
          latencyMs,
        },
        false,
        errorMessage,
      );

      throw error;
    }
  }

  private async callProvider(
    request: LLMRequest,
    apiKey: string,
  ): Promise<{ content: string; tokensUsed: { input: number; output: number } }> {
    switch (request.provider) {
      case 'openai':
        return this.callOpenAI(request, apiKey);
      case 'anthropic':
        return this.callAnthropic(request, apiKey);
      case 'google':
        return this.callGoogle(request, apiKey);
      default:
        throw new Error(`Unsupported LLM provider: ${request.provider}`);
    }
  }

  private async callOpenAI(
    request: LLMRequest,
    apiKey: string,
  ): Promise<{ content: string; tokensUsed: { input: number; output: number } }> {
    const body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
    };

    if (request.jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `OpenAI API error ${response.status}: ${errorBody}`,
      );
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage: { prompt_tokens: number; completion_tokens: number };
    };

    return {
      content: data.choices[0]?.message?.content ?? '',
      tokensUsed: {
        input: data.usage?.prompt_tokens ?? 0,
        output: data.usage?.completion_tokens ?? 0,
      },
    };
  }

  private async callAnthropic(
    request: LLMRequest,
    apiKey: string,
  ): Promise<{ content: string; tokensUsed: { input: number; output: number } }> {
    // Anthropic uses a different message format: system is separate from messages
    const systemMessage = request.messages.find(
      (message) => message.role === 'system',
    );
    const userMessages = request.messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      }));

    const body: Record<string, unknown> = {
      model: request.model,
      messages: userMessages,
      max_tokens: request.maxTokens ?? 2048,
      temperature: request.temperature ?? 0.7,
    };

    if (systemMessage) {
      body.system = systemMessage.content;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `Anthropic API error ${response.status}: ${errorBody}`,
      );
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
      usage: { input_tokens: number; output_tokens: number };
    };

    const textContent = data.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return {
      content: textContent,
      tokensUsed: {
        input: data.usage?.input_tokens ?? 0,
        output: data.usage?.output_tokens ?? 0,
      },
    };
  }

  private async callGoogle(
    request: LLMRequest,
    apiKey: string,
  ): Promise<{ content: string; tokensUsed: { input: number; output: number } }> {
    // Google Gemini uses a different format
    const systemMessage = request.messages.find(
      (message) => message.role === 'system',
    );
    const conversationMessages = request.messages.filter(
      (message) => message.role !== 'system',
    );

    const contents = conversationMessages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 2048,
      },
    };

    if (systemMessage) {
      body.systemInstruction = { parts: [{ text: systemMessage.content }] };
    }

    if (request.jsonMode) {
      (body.generationConfig as Record<string, unknown>).responseMimeType =
        'application/json';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `Google AI API error ${response.status}: ${errorBody}`,
      );
    }

    const data = (await response.json()) as {
      candidates: Array<{
        content: { parts: Array<{ text: string }> };
      }>;
      usageMetadata: {
        promptTokenCount: number;
        candidatesTokenCount: number;
      };
    };

    const textContent =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        ?.join('') ?? '';

    return {
      content: textContent,
      tokensUsed: {
        input: data.usageMetadata?.promptTokenCount ?? 0,
        output: data.usageMetadata?.candidatesTokenCount ?? 0,
      },
    };
  }

  private calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ): number {
    const rates = COST_TABLE[model];

    if (!rates) {
      // Fallback: estimate based on a generic rate
      return (inputTokens + outputTokens) * 0.000005;
    }

    const inputCost = (inputTokens / 1_000_000) * rates.input;
    const outputCost = (outputTokens / 1_000_000) * rates.output;

    return Number((inputCost + outputCost).toFixed(6));
  }

  private async logUsage(
    workspaceId: string,
    userId: string,
    feature: string,
    request: LLMRequest,
    response: LLMResponse,
    success: boolean,
    errorMessage?: string,
  ): Promise<void> {
    try {
      const log = this.usageLogRepo.create({
        workspaceId,
        userId,
        provider: request.provider as unknown as AIProvider,
        model: request.model,
        inputTokens: response.tokensUsed.input,
        outputTokens: response.tokensUsed.output,
        cost: response.cost,
        latencyMs: response.latencyMs,
        feature,
        success,
        errorMessage: errorMessage ?? '',
        piiDetected: false,
        piiMasked: false,
      });

      await this.usageLogRepo.save(log);

      // Update monthly spend on the model config
      if (success && response.cost > 0) {
        const config = await this.modelConfigRepo.findOne({
          where: {
            workspaceId,
            provider: request.provider as unknown as AIProvider,
            modelId: request.model,
          },
        });

        if (config) {
          config.monthlySpend =
            Number(config.monthlySpend) + Number(response.cost);
          await this.modelConfigRepo.save(config);
        }
      }
    } catch (loggingError) {
      this.logger.warn(
        `Failed to log LLM usage: ${loggingError instanceof Error ? loggingError.message : 'unknown'}`,
      );
    }
  }
}
