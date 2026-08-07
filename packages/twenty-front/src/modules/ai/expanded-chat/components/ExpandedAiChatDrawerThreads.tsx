import { styled } from '@linaria/react';

import { AiChatThreadsList } from '@/ai/components/AiChatThreadsList';
import { AiChatThreadClickBehaviorContext } from '@/ai/contexts/AiChatThreadClickBehaviorContext';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

// Rendered as the navigation drawer content while the expanded chat is
// open: the drawer becomes the inbox thread list, switching threads in
// place instead of reopening the side panel.
export const ExpandedAiChatDrawerThreads = () => (
  <StyledContainer>
    <AiChatThreadClickBehaviorContext.Provider value="in-place">
      <AiChatThreadsList />
    </AiChatThreadClickBehaviorContext.Provider>
  </StyledContainer>
);
