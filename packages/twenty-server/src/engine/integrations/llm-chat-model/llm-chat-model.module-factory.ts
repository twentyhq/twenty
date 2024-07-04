import { LLMChatModelDriver } from 'src/engine/integrations/llm-chat-model/interfaces/llm-chat-model.interface';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

export const llmChatModelModuleFactory = (
  environmentService: EnvironmentService,
) => {
  const driver = environmentService.get('LLM_CHAT_MODEL_DRIVER');

  switch (driver) {
    case LLMChatModelDriver.OpenAI: {
      return { type: LLMChatModelDriver.OpenAI };
    }
    default:
    // `No LLM chat model driver (${driver})`);
  }
};
