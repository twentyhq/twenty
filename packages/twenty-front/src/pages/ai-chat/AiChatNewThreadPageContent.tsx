import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';

const StyledChatContainer = styled.div`
  --ai-chat-content-max-width: 768px;

  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

type AiChatNewThreadPageContentProps = {
  headerActions?: ReactNode;
  showInformationBanner?: boolean;
};

export const AiChatNewThreadPageContent = ({
  headerActions,
  showInformationBanner = true,
}: AiChatNewThreadPageContentProps) => (
  <PageCardLayout
    header={<AiChatPageHeader actionButton={headerActions} />}
    showInformationBanner={showInformationBanner}
  >
    <StyledChatContainer>
      <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.PAGE}>
        <AiChatTab />
      </AiChatSurfaceContext.Provider>
    </StyledChatContainer>
  </PageCardLayout>
);
