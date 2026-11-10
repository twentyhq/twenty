import { AiChatAssistantMentionChip } from '@/ai/components/AiChatAssistantMentionChip';
import { ChatReferenceChip } from '@/ai/components/ChatReferenceChip';
import { StyledChatReferenceChipContainer } from '@/ai/components/StyledChatReferenceChipContainer';
import { ChatReferenceNavigationEnabledContext } from '@/ai/contexts/ChatReferenceNavigationEnabledContext';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { isString } from '@sniptt/guards';
import { useContext } from 'react';
import { isAgentChatAssistantReference } from 'twenty-shared/ai';

type ChatReferenceSegmentsProps = {
  segments: Array<string | ChatReferenceMatch>;
};

export const ChatReferenceSegments = ({
  segments,
}: ChatReferenceSegmentsProps) => {
  const isNavigationEnabled = useContext(ChatReferenceNavigationEnabledContext);

  return (
    <>
      {segments.map((segment) => {
        if (isString(segment)) {
          return segment;
        }

        if (isAgentChatAssistantReference(segment)) {
          return isNavigationEnabled ? (
            <StyledChatReferenceChipContainer key={segment.index}>
              <AiChatAssistantMentionChip />
            </StyledChatReferenceChipContainer>
          ) : (
            <span key={segment.index}>@{segment.displayName}</span>
          );
        }

        return <ChatReferenceChip key={segment.index} reference={segment} />;
      })}
    </>
  );
};
