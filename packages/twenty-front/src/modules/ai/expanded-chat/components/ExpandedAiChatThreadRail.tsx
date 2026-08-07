import { styled } from '@linaria/react';

import { AiChatThreadsList } from '@/ai/components/AiChatThreadsList';
import { AiChatThreadClickBehaviorContext } from '@/ai/contexts/AiChatThreadClickBehaviorContext';
import { EXPANDED_AI_CHAT_THREAD_RAIL_WIDTH } from '@/ai/expanded-chat/constants/ExpandedAiChatThreadRailWidth';

const StyledRail = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 0;
  width: ${EXPANDED_AI_CHAT_THREAD_RAIL_WIDTH}px;
`;

export const ExpandedAiChatThreadRail = () => (
  <StyledRail>
    <AiChatThreadClickBehaviorContext.Provider value="in-place">
      <AiChatThreadsList />
    </AiChatThreadClickBehaviorContext.Provider>
  </StyledRail>
);
