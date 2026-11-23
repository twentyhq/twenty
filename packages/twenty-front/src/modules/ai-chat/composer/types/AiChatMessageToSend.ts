import { type AiChatNewThreadRecipients } from '@/ai-chat/composer/types/AiChatNewThreadRecipients';
import { type AiChatParticipantMention } from '@/ai-chat/composer/types/AiChatParticipantMention';
import { type AiChatSendTarget } from '@/ai-chat/composer/types/AiChatSendTarget';

export type AiChatMessageToSend = AiChatSendTarget & {
  isNewChat: boolean;
  isDirectMessage: boolean;
  newThreadRecipients: AiChatNewThreadRecipients | undefined;
  serializedContentToSend: string;
  contentToSend: string;
  participantMentions: AiChatParticipantMention[];
  initialRecipients: AiChatParticipantMention[];
  isAssistantMentioned: boolean;
  channelId: string | null | undefined;
  quotedMessageId: string | null;
};
