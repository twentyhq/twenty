import { useParams } from 'react-router-dom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai-chat/components/AiChatCloseButton';
import { NavigatePreservingSearchAndHash } from '@/app/routing/components/NavigatePreservingSearchAndHash';
import { useLegacyAiChatInboxRedirectPath } from '@/legacy-ai-chat/hooks/useLegacyAiChatInboxRedirectPath';
import { AiChatNewThreadPageContent } from '@/ai-chat/instance/components/AiChatNewThreadPageContent';
import { AiChatThreadPageContent } from '@/ai-chat/instance/components/AiChatThreadPageContent';

export const LegacyAiChatPage = () => {
  const { threadId } = useParams();
  const isMobile = useIsMobile();
  const inboxRedirectPath = useLegacyAiChatInboxRedirectPath(threadId);

  if (isDefined(inboxRedirectPath)) {
    return <NavigatePreservingSearchAndHash to={inboxRedirectPath} />;
  }

  if (!isDefined(threadId) || !isValidUuid(threadId)) {
    return <AiChatNewThreadPageContent />;
  }

  return (
    <AiChatThreadPageContent
      threadId={threadId}
      headerActions={isMobile && <AiChatCloseButton />}
    />
  );
};
