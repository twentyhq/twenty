import { readFileSync } from 'fs';
import { join } from 'path';

import { PromptTemplate } from '@langchain/core/prompts';

import { LLMPromptTemplateDriver } from 'src/engine/integrations/llm-prompt-template/drivers/interfaces/llm-prompt-template-driver.interface';
import { LLMPromptTemplateEnvVar } from 'src/engine/integrations/llm-prompt-template/interfaces/llm-prompt-template-name.interface';
import { PromptTemplateInput } from 'src/engine/integrations/llm-prompt-template/interfaces/llm-prompt-template.interface';

import { resolveAbsolutePath } from 'src/utils/resolve-absolute-path';

export class FileDriver implements LLMPromptTemplateDriver {
  constructor() {}

  async getPromptTemplate<T extends LLMPromptTemplateEnvVar>(
    promptTemplateName: string,
  ): Promise<PromptTemplate<PromptTemplateInput<T>, any>> {
    const filePath = join(
      resolveAbsolutePath('.llm-prompt-templates'),
      `${promptTemplateName}.txt`,
    );

    let promptTemplateString: string;

    try {
      promptTemplateString = readFileSync(filePath, {
        encoding: 'utf-8',
      });
    } catch (e) {
      throw new Error(
        `Missing LLM prompt template at the following path: ${filePath}`,
      );
    }

    const promptTemplate = PromptTemplate.fromTemplate<any>(
      promptTemplateString,
      { templateFormat: 'mustache' },
    );

    return promptTemplate;
  }
}
