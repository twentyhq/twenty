import { isDefined } from 'twenty-shared/utils';

import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { InboxChannelsEffect } from '@/inbox/components/InboxChannelsEffect';
import { InboxRecentThreadListSyncEffect } from '@/inbox/components/InboxRecentThreadListSyncEffect';
import { InboxThreadInitializationEffect } from '@/inbox/components/InboxThreadInitializationEffect';
import { InboxThreadRecordOperationsEffect } from '@/inbox/components/InboxThreadRecordOperationsEffect';
import { FocusedTabEffect } from '@/web-push/components/FocusedTabEffect';
import { PushNotificationClickEffect } from '@/web-push/components/PushNotificationClickEffect';
import { PushSubscriptionEffect } from '@/web-push/components/PushSubscriptionEffect';
import { useIsWebPushEnabled } from '@/web-push/hooks/useIsWebPushEnabled';

export const InboxEffects = () => {
  const aiChatPageThreadId = useAiChatPageThreadId();
  const isWebPushEnabled = useIsWebPushEnabled();

  return (
    <>
      <InboxThreadInitializationEffect />
      <InboxThreadRecordOperationsEffect />
      <InboxChannelsEffect />
      {isWebPushEnabled && (
        <>
          <PushSubscriptionEffect />
          <FocusedTabEffect />
          <PushNotificationClickEffect />
        </>
      )}
      {isDefined(aiChatPageThreadId) && (
        <InboxRecentThreadListSyncEffect threadId={aiChatPageThreadId} />
      )}
    </>
  );
};
