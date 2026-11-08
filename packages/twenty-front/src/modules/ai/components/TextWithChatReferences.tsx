import { ChatReferenceChip } from '@/ai/components/ChatReferenceChip';
import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';
import { isString } from '@sniptt/guards';
import { isAgentChatAssistantReference } from 'twenty-shared/ai';

type TextWithChatReferencesProps = {
  text: string;
};

export const TextWithChatReferences = ({
  text,
}: TextWithChatReferencesProps) => {
  return (
    <>
      {getChatReferenceSegments(text).map((segment) => {
        if (isString(segment)) {
          return segment;
        }

        if (isAgentChatAssistantReference(segment)) {
          return <span key={segment.index}>@{segment.displayName}</span>;
        }

        return <ChatReferenceChip key={segment.index} reference={segment} />;
      })}
    </>
  );
};
