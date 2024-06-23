import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export interface LLMChatModelDriver {
  getJSONChatModel(): BaseChatModel;
}
