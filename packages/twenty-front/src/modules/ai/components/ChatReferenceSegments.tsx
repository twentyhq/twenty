import { ChatReferenceChip } from '@/ai/components/ChatReferenceChip';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { isString } from '@sniptt/guards';
import { isAgentChatAssistantReference } from 'twenty-shared/ai';

type ChatReferenceSegmentsProps = {
  segments: Array<string | ChatReferenceMatch>;
};

export const ChatReferenceSegments = ({
  segments,
}: ChatReferenceSegmentsProps) => {
  return (
    <>
      {segments.map((segment) => {
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
