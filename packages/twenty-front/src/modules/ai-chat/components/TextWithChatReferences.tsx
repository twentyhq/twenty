import { ChatReferenceSegments } from '@/ai-chat/components/ChatReferenceSegments';
import { getChatReferenceSegments } from '@/ai-chat/utils/getChatReferenceSegments';

type TextWithChatReferencesProps = {
  text: string;
};

export const TextWithChatReferences = ({
  text,
}: TextWithChatReferencesProps) => (
  <ChatReferenceSegments segments={getChatReferenceSegments(text)} />
);
