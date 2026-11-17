import { useParams } from 'react-router-dom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { NavigatePreservingSearchAndHash } from '@/app/routing/components/NavigatePreservingSearchAndHash';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLegacyAiChatInboxRedirectPath } from '@/legacy-ai-chat/hooks/useLegacyAiChatInboxRedirectPath';
import { AiChatNewThreadPageContent } from '~/pages/ai-chat/AiChatNewThreadPageContent';
import { AiChatPageEffects } from '~/pages/ai-chat/AiChatPageEffects';
import { AiChatThreadPageContent } from '~/pages/ai-chat/AiChatThreadPageContent';

export const LegacyAiChatPage = () => {
  const { threadId } = useParams();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const isMobile = useIsMobile();
  const inboxRedirectPath = useLegacyAiChatInboxRedirectPath(threadId);

  if (isDefined(inboxRedirectPath)) {
    return <NavigatePreservingSearchAndHash to={inboxRedirectPath} />;
  }

  if (!isDefined(threadId) || !isValidUuid(threadId)) {
    return (
      <>
        <AiChatPageEffects threadId={newAiChatThreadId} isNewChat />
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
