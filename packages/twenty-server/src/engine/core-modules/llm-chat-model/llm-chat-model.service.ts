import { Injectable, Inject } from '@nestjs/common';

import { LLMChatModelDriver } from 'src/engine/core-modules/llm-chat-model/drivers/interfaces/llm-prompt-template-driver.interface';

import { LLM_CHAT_MODEL_DRIVER } from 'src/engine/core-modules/llm-chat-model/llm-chat-model.constants';

@Injectable()
export class LLMChatModelService {
  constructor(
    @Inject(LLM_CHAT_MODEL_DRIVER) private driver: LLMChatModelDriver,
  ) {}

  getJSONChatModel() {
    return this.driver.getJSONChatModel();
  }
}
