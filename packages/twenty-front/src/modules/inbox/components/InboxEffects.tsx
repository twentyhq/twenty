import { InboxSyncEffect } from '@/inbox/components/InboxSyncEffect';
import { useIsInboxWebPushEnabled } from '@/inbox/hooks/useIsInboxWebPushEnabled';
import { FocusedTabEffect } from '@/web-push/components/FocusedTabEffect';
import { WebPushSubscriptionEffect } from '@/web-push/components/WebPushSubscriptionEffect';

export const InboxEffects = () => {
  const isInboxWebPushEnabled = useIsInboxWebPushEnabled();

  return (
    <>
      <InboxSyncEffect />
      {isInboxWebPushEnabled && (
        <>
          <WebPushSubscriptionEffect />
          <FocusedTabEffect />
        </>
      )}
    </>
  );
};
