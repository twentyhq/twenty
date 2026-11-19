import { InboxNewThreadListToggle } from '@/inbox/components/InboxNewThreadListToggle';
import { styled } from '@linaria/react';
import { type ReactNode, useId } from 'react';

import { AiChatInstance } from '@/ai-chat/components/AiChatInstance';
import { AiChatPageHeader } from '@/ai-chat/components/AiChatPageHeader';
import { AiChatTab } from '@/ai-chat/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai-chat/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai-chat/contexts/AiChatSurfaceContext';
import { useSelectAiChatThreadFromNewChat } from '@/ai-chat/hooks/useSelectAiChatThreadFromNewChat';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
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
  const { selectAiChatThreadFromNewChat } = useSelectAiChatThreadFromNewChat();

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
            onThreadChange={selectAiChatThreadFromNewChat}
          >
            <AiChatTab />
          </AiChatInstance>
        </AiChatSurfaceContext.Provider>
      </StyledChatContainer>
    </PageCardLayout>
  );
};
