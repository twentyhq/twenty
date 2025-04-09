import { LLMChatModelDriver } from 'src/engine/core-modules/llm-chat-model/interfaces/llm-chat-model.interface';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const llmChatModelModuleFactory = (
  twentyConfigService: TwentyConfigService,
) => {
  const driver = twentyConfigService.get('LLM_CHAT_MODEL_DRIVER');

  switch (driver) {
    case LLMChatModelDriver.OpenAI: {
      return { type: LLMChatModelDriver.OpenAI };
    }
    default:
    // `No LLM chat model driver (${driver})`);
  }
};
