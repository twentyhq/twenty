import { ChatReferenceChip } from '@/ai/components/ChatReferenceChip';
import { AiChatAssistantMentionChip } from '@/ai/components/AiChatAssistantMentionChip';
import { StyledChatReferenceChipContainer } from '@/ai/components/StyledChatReferenceChipContainer';
import { ChatReferenceNavigationEnabledContext } from '@/ai/contexts/ChatReferenceNavigationEnabledContext';
import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';
import { isString } from '@sniptt/guards';
import { useContext } from 'react';
import { isAgentChatAssistantReference } from 'twenty-shared/ai';

type TextWithChatReferencesProps = {
  text: string;
};

export const TextWithChatReferences = ({
  text,
}: TextWithChatReferencesProps) => {
  const isNavigationEnabled = useContext(ChatReferenceNavigationEnabledContext);

  return (
    <>
      {getChatReferenceSegments(text).map((segment) => {
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
