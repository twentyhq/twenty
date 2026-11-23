import { InboxChannelSyncEffect } from '@/inbox/components/InboxChannelSyncEffect';
import { InboxThreadSyncEffect } from '@/inbox/components/InboxThreadSyncEffect';
import { useIsInboxWebPushEnabled } from '@/inbox/hooks/useIsInboxWebPushEnabled';
import { FocusedTabEffect } from '@/web-push/components/FocusedTabEffect';
import { WebPushSubscriptionEffect } from '@/web-push/components/WebPushSubscriptionEffect';

export const InboxEffects = () => {
  const isInboxWebPushEnabled = useIsInboxWebPushEnabled();

  return (
    <>
      <InboxThreadSyncEffect />
      <InboxChannelSyncEffect />
      {isInboxWebPushEnabled && (
        <>
          <WebPushSubscriptionEffect />
          <FocusedTabEffect />
        </>
      )}
    </>
  );
};
