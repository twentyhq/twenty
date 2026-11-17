import { useParams } from 'react-router-dom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AiChatNewThreadPageContent } from '~/pages/ai-chat/AiChatNewThreadPageContent';
import { AiChatPageEffects } from '~/pages/ai-chat/AiChatPageEffects';
import { AiChatThreadPageContent } from '~/pages/ai-chat/AiChatThreadPageContent';

export const AiChatPage = () => {
  const { threadId } = useParams();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const isMobile = useIsMobile();

  if (!isDefined(threadId) || !isValidUuid(threadId)) {
    return (
      <>
        <AiChatPageEffects threadId={newAiChatThreadId} isNewChat />
        {/* A new chat has no record until its first message is sent */}
        <AiChatNewThreadPageContent />
      </>
    );
  }

  return (
    <>
      <AiChatPageEffects threadId={threadId} isNewChat={false} />
      <AiChatThreadPageContent
        threadId={threadId}
        headerActions={isMobile && <AiChatCloseButton />}
      />
    </>
  );
};
