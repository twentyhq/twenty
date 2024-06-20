import { PromptTemplate } from '@langchain/core/prompts';

export interface LLMPromptTemplateDriver {
  getPromptTemplate(
    promptTemplateName: string,
  ): Promise<PromptTemplate<any, any>>;
}
