import { Inject, Injectable } from '@nestjs/common';

import { PromptTemplate } from '@langchain/core/prompts';

import { LLMPromptTemplateDriver } from 'src/engine/integrations/llm-prompt-template/drivers/interfaces/llm-prompt-template-driver.interface';
import { LLMPromptTemplateEnvVar } from 'src/engine/integrations/llm-prompt-template/interfaces/llm-prompt-template-name.interface';
import { PromptTemplateInput } from 'src/engine/integrations/llm-prompt-template/interfaces/llm-prompt-template.interface';

import { LLM_PROMPT_TEMPLATE_DRIVER } from 'src/engine/integrations/llm-prompt-template/llm-prompt-template.constants';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class LLMPromptTemplateService {
  constructor(
    private environmentService: EnvironmentService,
    @Inject(LLM_PROMPT_TEMPLATE_DRIVER) private driver: LLMPromptTemplateDriver,
  ) {}

  getPromptTemplate<T extends LLMPromptTemplateEnvVar>(
    type: T,
  ): Promise<PromptTemplate<PromptTemplateInput<T>, any>> {
    const promptTemplateName: string = this.environmentService.get(type);

    return this.driver.getPromptTemplate(promptTemplateName);
  }
}
