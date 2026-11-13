import { styled } from '@linaria/react';
import { InboxTab } from '@/ai/components/InboxTab';
import { INBOX_SURFACE } from '@/ai/constants/InboxSurface';
import { InboxSurfaceContext } from '@/ai/contexts/InboxSurfaceContext';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const SidePanelAskAiPage = () => {
  return (
    <InboxSurfaceContext.Provider value={INBOX_SURFACE.SIDE_PANEL}>
      <StyledContainer>
        <InboxTab />
      </StyledContainer>
    </InboxSurfaceContext.Provider>
  );
};
