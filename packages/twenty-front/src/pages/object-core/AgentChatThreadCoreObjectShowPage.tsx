import { Navigate } from 'react-router-dom';
import { getAppPath } from 'twenty-shared/utils';

import { getAiChatPageRoute } from '@/ai-chat/utils/getAiChatPageRoute';
import { AiChatThreadPageContent } from '@/inbox/components/AiChatThreadPageContent';
import { type CoreObjectShowPageProps } from '@/object-core/types/CoreObjectShowPageProps';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type AgentChatThreadCoreObjectShowPageProps = CoreObjectShowPageProps;

// A chat's record page is the chat page, on its own route
export const AgentChatThreadCoreObjectShowPage = ({
  objectRecordId,
}: AgentChatThreadCoreObjectShowPageProps) => {
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  if (isInSidePanel) {
    return <AiChatThreadPageContent threadId={objectRecordId} />;
  }

  const aiChatPageRoute = getAiChatPageRoute({
    isInbox: isAiChatInboxEnabled,
    threadId: objectRecordId,
  });

  return (
    <Navigate
      replace
      to={getAppPath(aiChatPageRoute.appPath, {
        threadId: aiChatPageRoute.threadId,
      })}
    />
  );
};
