import { styled } from '@linaria/react';
import { type ReactNode, useId } from 'react';

import { AiChatPageHeader } from '@/ai-chat/components/AiChatPageHeader';
import { AiChatSurfaceView } from '@/ai-chat/instance/components/AiChatSurfaceView';
import { AI_CHAT_SURFACE } from '@/ai-chat/constants/AiChatSurface';
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
  headerIcon?: ReactNode;
  headerActions?: ReactNode;
  showInformationBanner?: boolean;
};

export const AiChatNewThreadPageContent = ({
  headerIcon,
  headerActions,
  showInformationBanner = true,
}: AiChatNewThreadPageContentProps) => {
  const instanceId = useId();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const { selectAiChatThreadFromNewChat } = useSelectAiChatThreadFromNewChat();

  return (
    <PageCardLayout
      header={
        <AiChatPageHeader icon={headerIcon} actionButton={headerActions} />
      }
      showInformationBanner={showInformationBanner}
    >
      <StyledChatContainer>
        <AiChatSurfaceView
          surface={AI_CHAT_SURFACE.PAGE}
          instanceId={instanceId}
          threadId={newAiChatThreadId}
          onThreadChange={selectAiChatThreadFromNewChat}
        />
      </StyledChatContainer>
    </PageCardLayout>
  );
};
