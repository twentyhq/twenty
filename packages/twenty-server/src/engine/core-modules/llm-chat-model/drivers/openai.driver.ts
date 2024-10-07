import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';

import { LLMChatModelDriver } from 'src/engine/core-modules/llm-chat-model/drivers/interfaces/llm-prompt-template-driver.interface';

export class OpenAIDriver implements LLMChatModelDriver {
  private chatModel: BaseChatModel;

  constructor() {
    this.chatModel = new ChatOpenAI({
      model: 'gpt-4o',
    }).bind({
      response_format: {
        type: 'json_object',
      },
    }) as unknown as BaseChatModel;
  }

  getJSONChatModel() {
    return this.chatModel;
  }
}
