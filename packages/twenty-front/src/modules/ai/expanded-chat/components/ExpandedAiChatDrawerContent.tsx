import { styled } from '@linaria/react';

import { ExpandedAiChatDrawerThreads } from '@/ai/expanded-chat/components/ExpandedAiChatDrawerThreads';
import { InboxNotificationsSections } from '@/notification/components/InboxNotificationsSections';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

// The inbox drawer: attention items first, then the conversation list.
export const ExpandedAiChatDrawerContent = () => (
  <StyledContainer>
    <InboxNotificationsSections />
    <ExpandedAiChatDrawerThreads />
  </StyledContainer>
);
