import { ChatReferenceSegments } from '@/ai/components/ChatReferenceSegments';
import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';

type TextWithChatReferencesProps = {
  text: string;
};

export const TextWithChatReferences = ({
  text,
}: TextWithChatReferencesProps) => (
  <ChatReferenceSegments segments={getChatReferenceSegments(text)} />
);
