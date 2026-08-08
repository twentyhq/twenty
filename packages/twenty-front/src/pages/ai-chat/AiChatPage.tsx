import { styled } from '@linaria/react';

import { AiChatPageCloseAskAiPanelEffect } from '@/ai/components/AiChatPageCloseAskAiPanelEffect';
import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';

const StyledCenteredChatContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
  max-width: 768px;
  min-height: 0;
  width: 100%;
`;

export const AiChatPage = () => {
  return (
    <PageContainer>
      <AiChatPageThreadUrlSyncEffect />
      <AiChatPageCloseAskAiPanelEffect />
      <AiChatPageHeader />
      <PageBody>
        <StyledCenteredChatContainer>
          <AiChatTab />
        </StyledCenteredChatContainer>
      </PageBody>
    </PageContainer>
  );
};
