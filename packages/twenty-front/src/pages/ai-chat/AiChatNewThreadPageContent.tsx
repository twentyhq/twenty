import { InboxNewThreadListToggle } from '@/inbox/components/InboxNewThreadListToggle';
import { styled } from '@linaria/react';
import { type ReactNode, useId } from 'react';

import { AiChatInstance } from '@/ai/components/AiChatInstance';
import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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
}: AiChatNewThreadPageContentProps) => {
  const instanceId = useId();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const { selectAiChatThread } = useSelectAiChatThread();

  return (
    <PageCardLayout
      header={
        <AiChatPageHeader
          icon={<InboxNewThreadListToggle />}
          actionButton={headerActions}
        />
      }
      showInformationBanner={showInformationBanner}
    >
      <StyledChatContainer>
        <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.PAGE}>
          <AiChatInstance
            instanceId={instanceId}
            threadId={currentAiChatThread ?? newAiChatThreadId}
            onThreadChange={selectAiChatThread}
          >
            <AiChatTab />
          </AiChatInstance>
        </AiChatSurfaceContext.Provider>
      </StyledChatContainer>
    </PageCardLayout>
  );
};
