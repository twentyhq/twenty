import { getChatReferenceSegments } from 'twenty-shared/ai';
import { ChatReferenceSegments } from '@/ai-chat/message-content/components/ChatReferenceSegments';

type TextWithChatReferencesProps = {
  text: string;
};

export const TextWithChatReferences = ({
  text,
}: TextWithChatReferencesProps) => (
  <ChatReferenceSegments segments={getChatReferenceSegments(text)} />
);
