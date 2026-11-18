import { ChatReferenceSegments } from '@/ai-chat/message-content/components/ChatReferenceSegments';
import { getChatReferenceSegments } from '@/ai-chat/message-content/utils/getChatReferenceSegments';

type TextWithChatReferencesProps = {
  text: string;
};

export const TextWithChatReferences = ({
  text,
}: TextWithChatReferencesProps) => (
  <ChatReferenceSegments segments={getChatReferenceSegments(text)} />
);
