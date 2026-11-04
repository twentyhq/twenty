import { ChatReferenceChip } from '@/ai/components/ChatReferenceChip';
import { getProtectedChatReferenceSegments } from '@/ai/utils/getProtectedChatReferenceSegments';

type TextWithProtectedChatReferencesProps = {
  text: string;
};

export const TextWithProtectedChatReferences = ({
  text,
}: TextWithProtectedChatReferencesProps) => {
  return (
    <>
      {getProtectedChatReferenceSegments(text).map((segment) =>
        typeof segment === 'string' ? (
          segment
        ) : (
          <ChatReferenceChip key={segment.index} reference={segment} />
        ),
      )}
    </>
  );
};
