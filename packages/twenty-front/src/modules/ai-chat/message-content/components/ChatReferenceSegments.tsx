import { AiChatAssistantMentionChip } from '@/ai-chat/components/AiChatAssistantMentionChip';
import { ChatReferenceChip } from '@/ai-chat/message-content/components/ChatReferenceChip';
import { StyledChatReferenceChipContainer } from '@/ai-chat/message-content/components/StyledChatReferenceChipContainer';
import { ChatReferenceNavigationEnabledContext } from '@/ai-chat/message-content/contexts/ChatReferenceNavigationEnabledContext';
import { isString } from '@sniptt/guards';
import { useContext } from 'react';
import {
  type ChatReferenceMatch,
  isAgentChatAssistantReference,
} from 'twenty-shared/ai';

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
