import { styled } from '@linaria/react';

import { AiChatThreadsList } from '@/ai/components/AiChatThreadsList';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

// Rendered as part of the navigation drawer content while the expanded
// chat is open; the surrounding drawer content provides the in-place
// thread click behavior.
export const ExpandedAiChatDrawerThreads = () => (
  <StyledContainer>
    <AiChatThreadsList />
  </StyledContainer>
);
