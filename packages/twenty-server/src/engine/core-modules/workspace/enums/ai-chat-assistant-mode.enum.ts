import { registerEnumType } from '@nestjs/graphql';

export enum AiChatAssistantMode {
  NEVER = 'NEVER',
  MENTION_ONLY = 'MENTION_ONLY',
  AUTOMATIC = 'AUTOMATIC',
}

registerEnumType(AiChatAssistantMode, { name: 'AiChatAssistantMode' });
