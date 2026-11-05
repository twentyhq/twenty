import { ChatReferenceChip } from '@/ai/components/ChatReferenceChip';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';

type TextWithChatReferencesProps = {
  segments: Array<string | ChatReferenceMatch>;
};

export const TextWithChatReferences = ({
  segments,
}: TextWithChatReferencesProps) => {
  return (
    <>
      {segments.map((segment) =>
        typeof segment === 'string' ? (
          segment
        ) : (
          <ChatReferenceChip key={segment.index} reference={segment} />
        ),
      )}
    </>
  );
};
