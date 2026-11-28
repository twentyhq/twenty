import { Navigate } from 'react-router-dom';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { getAiChatPageRoute } from '@/ai-chat/utils/getAiChatPageRoute';
import { AiChatThreadPageContent } from '@/ai-chat/instance/components/AiChatThreadPageContent';
import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { InboxThreadPageContent } from '@/inbox/components/InboxThreadPageContent';
import { InboxThreadRecordPage } from '@/inbox/components/InboxThreadRecordPage';
import { type CoreObjectShowPageProps } from '@/object-core/types/CoreObjectShowPageProps';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type AiChatThreadRecordViewProps = CoreObjectShowPageProps;

export const AiChatThreadRecordView = ({
  objectRecordId,
}: AiChatThreadRecordViewProps) => {
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const inboxRecordRouteObjectNames = useAtomStateValue(
    inboxRecordRouteObjectNamesSelector,
  );

  if (isInSidePanel) {
    return isAiChatInboxEnabled ? (
      <InboxThreadPageContent threadId={objectRecordId} />
    ) : (
      <AiChatThreadPageContent threadId={objectRecordId} />
    );
  }

  if (isDefined(inboxRecordRouteObjectNames)) {
    return <InboxThreadRecordPage threadId={objectRecordId} />;
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
