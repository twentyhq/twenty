import { DynamicModule, Global } from '@nestjs/common';

import {
  LLMChatModelDriver,
  LLMChatModelModuleAsyncOptions,
} from 'src/engine/core-modules/llm-chat-model/interfaces/llm-chat-model.interface';

import { LLM_CHAT_MODEL_DRIVER } from 'src/engine/core-modules/llm-chat-model/llm-chat-model.constants';
import { OpenAIDriver } from 'src/engine/core-modules/llm-chat-model/drivers/openai.driver';
import { LLMChatModelService } from 'src/engine/core-modules/llm-chat-model/llm-chat-model.service';

@Global()
export class LLMChatModelModule {
  static forRoot(options: LLMChatModelModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: LLM_CHAT_MODEL_DRIVER,
      useFactory: (...args: any[]) => {
        const config = options.useFactory(...args);

        switch (config?.type) {
          case LLMChatModelDriver.OpenAI: {
            return new OpenAIDriver();
          }
        }
      },
      inject: options.inject || [],
    };

    return {
      module: LLMChatModelModule,
      providers: [LLMChatModelService, provider],
      exports: [LLMChatModelService],
    };
  }
}
