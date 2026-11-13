import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { InboxThreadPageHeader } from '@/ai/components/InboxThreadPageHeader';
import { InboxTab } from '@/ai/components/InboxTab';
import { INBOX_SURFACE } from '@/ai/constants/InboxSurface';
import { InboxSurfaceContext } from '@/ai/contexts/InboxSurfaceContext';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';

const StyledChatContainer = styled.div`
  --ai-chat-content-max-width: 768px;

  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

type InboxNewThreadPageContentProps = {
  headerActions?: ReactNode;
  showInformationBanner?: boolean;
};

export const InboxNewThreadPageContent = ({
  headerActions,
  showInformationBanner = true,
}: InboxNewThreadPageContentProps) => (
  <PageCardLayout
    header={<InboxThreadPageHeader actionButton={headerActions} />}
    showInformationBanner={showInformationBanner}
  >
    <StyledChatContainer>
      <InboxSurfaceContext.Provider value={INBOX_SURFACE.PAGE}>
        <InboxTab />
      </InboxSurfaceContext.Provider>
    </StyledChatContainer>
  </PageCardLayout>
);
