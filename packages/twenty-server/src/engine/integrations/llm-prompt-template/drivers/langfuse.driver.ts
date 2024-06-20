import { PromptTemplate } from '@langchain/core/prompts';
import { Langfuse } from 'langfuse-langchain';

import { LLMPromptTemplateDriver } from 'src/engine/integrations/llm-prompt-template/drivers/interfaces/llm-prompt-template-driver.interface';

export class LangfuseDriver implements LLMPromptTemplateDriver {
  private langfuse: Langfuse;

  constructor() {
    this.langfuse = new Langfuse();
  }

  async getPromptTemplate(
    promptTemplateName: string,
  ): Promise<PromptTemplate<any, any>> {
    const langfusePrompt = await this.langfuse.getPrompt(promptTemplateName);

    return PromptTemplate.fromTemplate<any>(
      langfusePrompt.getLangchainPrompt(),
    );
  }
}
