import { styled } from '@linaria/react';

import { ExpandedAiChatDrawerThreads } from '@/ai/expanded-chat/components/ExpandedAiChatDrawerThreads';
import { AiChatThreadClickBehaviorContext } from '@/ai/contexts/AiChatThreadClickBehaviorContext';
import { InboxNotificationsSections } from '@/notification/components/InboxNotificationsSections';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

export const ExpandedAiChatDrawerContent = () => (
  <StyledContainer>
    <AiChatThreadClickBehaviorContext.Provider value="in-place">
      <InboxNotificationsSections />
      <ExpandedAiChatDrawerThreads />
    </AiChatThreadClickBehaviorContext.Provider>
  </StyledContainer>
);
