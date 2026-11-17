import { InboxNewThreadListToggle } from '@/inbox/components/InboxNewThreadListToggle';
import { styled } from '@linaria/react';
import { useStore } from 'jotai';
import { type ReactNode, useId } from 'react';

import { AiChatInstance } from '@/ai/components/AiChatInstance';
import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { getCurrentAiChatPageThreadId } from '@/ai/utils/getCurrentAiChatPageThreadId';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const { selectAiChatThread } = useSelectAiChatThread();
  const store = useStore();

  const handleThreadChange = (threadId: string) => {
    const isPageStillOnNewChat =
      getCurrentAiChatPageThreadId(store) ===
      store.get(newAiChatThreadIdState.atom);

    if (isPageStillOnNewChat) {
      selectAiChatThread(threadId);
    }
  };

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
            threadId={newAiChatThreadId}
            onThreadChange={handleThreadChange}
          >
            <AiChatTab />
          </AiChatInstance>
        </AiChatSurfaceContext.Provider>
      </StyledChatContainer>
    </PageCardLayout>
  );
};
