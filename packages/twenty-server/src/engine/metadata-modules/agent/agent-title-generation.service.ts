import { Injectable, Logger } from '@nestjs/common';

import { generateText } from 'ai';

import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class AgentTitleGenerationService {
  private readonly logger = new Logger(AgentTitleGenerationService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async generateThreadTitle(messageContent: string): Promise<string> {
    try {
      const defaultModel = this.aiModelRegistryService.getDefaultModel();

      if (!defaultModel) {
        this.logger.warn('No default AI model available for title generation');

        return this.generateFallbackTitle(messageContent);
      }

      const result = await generateText({
        model: defaultModel.model,
        prompt: `Generate a concise, descriptive title (maximum 60 characters) for a chat thread based on the following message. The title should capture the main topic or purpose of the conversation. Return only the title, nothing else. Message: "${messageContent}"`,
      });

      return this.cleanTitle(result.text);
    } catch (error) {
      this.logger.error('Failed to generate title with AI:', error);

      return this.generateFallbackTitle(messageContent);
    }
  }

  private generateFallbackTitle(messageContent: string): string {
    const cleanContent = messageContent.trim().replace(/\s+/g, ' ');
    const title = cleanContent.substring(0, 50);

    return cleanContent.length > 50 ? `${title}...` : title;
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/^["']|["']$/g, '')
      .trim()
      .replace(/\s+/g, ' ');
  }
}
