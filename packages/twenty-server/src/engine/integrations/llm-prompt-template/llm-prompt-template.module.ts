import { DynamicModule, Global } from '@nestjs/common';

import {
  LLMPromptTemplateDriver,
  LLMPromptTemplateModuleAsyncOptions,
} from 'src/engine/integrations/llm-prompt-template/interfaces/llm-prompt-template.interface';

import { LangfuseDriver } from 'src/engine/integrations/llm-prompt-template/drivers/langfuse.driver';
import { LLM_PROMPT_TEMPLATE_DRIVER } from 'src/engine/integrations/llm-prompt-template/llm-prompt-template.constants';
import { FileDriver } from 'src/engine/integrations/llm-prompt-template/drivers/file.driver';
import { LLMPromptTemplateService } from 'src/engine/integrations/llm-prompt-template/llm-prompt-template.service';

@Global()
export class LLMPromptTemplateModule {
  static forRoot(options: LLMPromptTemplateModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: LLM_PROMPT_TEMPLATE_DRIVER,
      useFactory: (...args: any[]) => {
        const config = options.useFactory(...args);

        return config.type === LLMPromptTemplateDriver.Langfuse
          ? new LangfuseDriver()
          : new FileDriver();
      },
      inject: options.inject || [],
    };

    return {
      module: LLMPromptTemplateModule,
      providers: [LLMPromptTemplateService, provider],
      exports: [LLMPromptTemplateService],
    };
  }
}
