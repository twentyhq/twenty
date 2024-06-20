import { NotImplementedException } from '@nestjs/common';

import { PromptTemplate } from '@langchain/core/prompts';

import { LLMPromptTemplateDriver } from 'src/engine/integrations/llm-prompt-template/drivers/interfaces/llm-prompt-template-driver.interface';
import { LLMPromptTemplateEnvVar } from 'src/engine/integrations/llm-prompt-template/interfaces/llm-prompt-template-name.interface';
import { PromptTemplateInput } from 'src/engine/integrations/llm-prompt-template/interfaces/llm-prompt-template.interface';

export class FileDriver implements LLMPromptTemplateDriver {
  constructor() {}

  async getPromptTemplate<T extends LLMPromptTemplateEnvVar>(
    promptTemplateName: string,
  ): Promise<PromptTemplate<PromptTemplateInput<T>, any>> {
    throw new NotImplementedException();
  }
}
