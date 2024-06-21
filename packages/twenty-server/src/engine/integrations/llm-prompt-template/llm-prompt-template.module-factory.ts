import { LLMPromptTemplateDriver } from 'src/engine/integrations/llm-prompt-template/interfaces/llm-prompt-template.interface';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

export const llmPromptTemplateModuleFactory = (
  environmentService: EnvironmentService,
) => {
  const driver = environmentService.get('LLM_PROMPT_TEMPLATE_DRIVER');

  switch (driver) {
    case LLMPromptTemplateDriver.File: {
      return { type: LLMPromptTemplateDriver.File };
    }
    case LLMPromptTemplateDriver.Langfuse: {
      const secretKey = environmentService.get('LANGFUSE_SECRET_KEY');
      const publicKey = environmentService.get('LANGFUSE_PUBLIC_KEY');

      if (!(secretKey && publicKey)) {
        throw new Error(
          `${driver} LLM prompt template driver requires LANGFUSE_SECRET_KEY and LANGFUSE_PUBLIC_KEY to be defined, check your .env file`,
        );
      }

      return { type: LLMPromptTemplateDriver.Langfuse };
    }
    default:
      throw new Error(
        `Invalid LLM prompt template driver (${driver}), check your .env file`,
      );
  }
};
