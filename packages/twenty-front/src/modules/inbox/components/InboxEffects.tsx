import { isDefined } from 'twenty-shared/utils';

import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { InboxChannelsEffect } from '@/inbox/components/InboxChannelsEffect';
import { InboxRecentThreadListSyncEffect } from '@/inbox/components/InboxRecentThreadListSyncEffect';
import { InboxThreadInitializationEffect } from '@/inbox/components/InboxThreadInitializationEffect';
import { InboxThreadRecordOperationsEffect } from '@/inbox/components/InboxThreadRecordOperationsEffect';
import { useIsInboxWebPushEnabled } from '@/inbox/hooks/useIsInboxWebPushEnabled';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { OnlineWorkspaceMemberIdsEffect } from '@/tab-presence/components/OnlineWorkspaceMemberIdsEffect';
import { TabPresenceEffect } from '@/tab-presence/components/TabPresenceEffect';
import { WebPushSubscriptionEffect } from '@/web-push/components/WebPushSubscriptionEffect';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const InboxEffects = () => {
  const aiChatPageThreadId = useAiChatPageThreadId();
  const isInboxWebPushEnabled = useIsInboxWebPushEnabled();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  return (
    <>
      <InboxThreadInitializationEffect />
      <InboxThreadRecordOperationsEffect />
      <InboxChannelsEffect />
      {isAiChatInboxEnabled && <TabPresenceEffect />}
      {isAiChatInboxEnabled && hasAiPermission && (
        <OnlineWorkspaceMemberIdsEffect />
      )}
      {isInboxWebPushEnabled && <WebPushSubscriptionEffect />}
      {isDefined(aiChatPageThreadId) && (
        <InboxRecentThreadListSyncEffect threadId={aiChatPageThreadId} />
      )}
    </>
  );
};
