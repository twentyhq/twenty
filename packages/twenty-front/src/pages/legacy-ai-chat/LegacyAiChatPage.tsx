import { useParams } from 'react-router-dom';
import { getAppPath, isDefined, isValidUuid } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { getAiChatPageRoute } from '@/ai/utils/getAiChatPageRoute';
import { NavigatePreservingSearchAndHash } from '@/app/routing/components/NavigatePreservingSearchAndHash';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { AiChatNewThreadPageContent } from '~/pages/ai-chat/AiChatNewThreadPageContent';
import { AiChatPageEffects } from '~/pages/ai-chat/AiChatPageEffects';
import { AiChatThreadPageContent } from '~/pages/ai-chat/AiChatThreadPageContent';

export const LegacyAiChatPage = () => {
  const { threadId } = useParams();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const isMobile = useIsMobile();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const isThreadUrl = isDefined(threadId) && isValidUuid(threadId);

  if (isAiChatInboxEnabled) {
    const inboxRoute = getAiChatPageRoute({
      isInbox: true,
      threadId: isThreadUrl ? threadId : null,
    });

    return (
      <NavigatePreservingSearchAndHash
        to={getAppPath(inboxRoute.appPath, { threadId: inboxRoute.threadId })}
      />
    );
  }

  if (!isThreadUrl) {
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
