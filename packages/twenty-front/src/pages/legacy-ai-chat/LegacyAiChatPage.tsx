import { useParams } from 'react-router-dom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai-chat/components/AiChatCloseButton';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { NavigatePreservingSearchAndHash } from '@/app/routing/components/NavigatePreservingSearchAndHash';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLegacyAiChatInboxRedirectPath } from '@/legacy-ai-chat/hooks/useLegacyAiChatInboxRedirectPath';
import { AiChatNewThreadPageContent } from '@/ai-chat/instance/components/AiChatNewThreadPageContent';
import { AiChatPageContinueInSidePanelEffect } from '@/ai-chat/components/AiChatPageContinueInSidePanelEffect';
import { AiChatThreadPageContent } from '@/ai-chat/instance/components/AiChatThreadPageContent';

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
        <AiChatPageContinueInSidePanelEffect threadId={newAiChatThreadId} />
        <AiChatNewThreadPageContent />
      </>
    );
  }

  return (
    <>
      <AiChatPageContinueInSidePanelEffect threadId={threadId} />
      <AiChatThreadPageContent
        threadId={threadId}
        headerActions={isMobile && <AiChatCloseButton />}
      />
    </>
  );
};
