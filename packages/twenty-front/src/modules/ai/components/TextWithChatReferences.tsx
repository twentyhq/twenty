import { ChatReferenceChip } from '@/ai/components/ChatReferenceChip';
import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';

type TextWithChatReferencesProps = {
  text: string;
};

export const TextWithChatReferences = ({
  text,
}: TextWithChatReferencesProps) => {
  return (
    <>
      {getChatReferenceSegments(text).map((segment) =>
        typeof segment === 'string' ? (
          segment
        ) : (
          <ChatReferenceChip key={segment.index} reference={segment} />
        ),
      )}
    </>
  );
};
