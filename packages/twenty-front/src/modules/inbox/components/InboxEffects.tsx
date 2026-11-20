import { isDefined } from 'twenty-shared/utils';

import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { InboxChannelsEffect } from '@/inbox/components/InboxChannelsEffect';
import { InboxRecentThreadListSyncEffect } from '@/inbox/components/InboxRecentThreadListSyncEffect';
import { InboxThreadInitializationEffect } from '@/inbox/components/InboxThreadInitializationEffect';
import { InboxThreadRecordOperationsEffect } from '@/inbox/components/InboxThreadRecordOperationsEffect';
import { useIsInboxWebPushEnabled } from '@/inbox/hooks/useIsInboxWebPushEnabled';
import { FocusedTabEffect } from '@/web-push/components/FocusedTabEffect';
import { WebPushSubscriptionEffect } from '@/web-push/components/WebPushSubscriptionEffect';

export const InboxEffects = () => {
  const aiChatPageThreadId = useAiChatPageThreadId();
  const isInboxWebPushEnabled = useIsInboxWebPushEnabled();

  return (
    <>
      <InboxThreadInitializationEffect />
      <InboxThreadRecordOperationsEffect />
      <InboxChannelsEffect />
      {isInboxWebPushEnabled && (
        <>
          <WebPushSubscriptionEffect />
          <FocusedTabEffect />
        </>
      )}
      {isDefined(aiChatPageThreadId) && (
        <InboxRecentThreadListSyncEffect threadId={aiChatPageThreadId} />
      )}
    </>
  );
};
