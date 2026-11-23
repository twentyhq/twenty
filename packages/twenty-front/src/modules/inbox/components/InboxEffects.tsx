import { isImpersonatingState } from '@/auth/states/isImpersonatingState';
import { InboxAppBadgeEffect } from '@/inbox/components/InboxAppBadgeEffect';
import { InboxChannelSyncEffect } from '@/inbox/components/InboxChannelSyncEffect';
import { InboxThreadSyncEffect } from '@/inbox/components/InboxThreadSyncEffect';
import { useIsInboxWebPushEnabled } from '@/inbox/hooks/useIsInboxWebPushEnabled';
import { useActiveNavigationDrawerTab } from '@/navigation/hooks/useActiveNavigationDrawerTab';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { OnlineWorkspaceMemberIdsEffect } from '@/tab-presence/components/OnlineWorkspaceMemberIdsEffect';
import { TabPresenceEffect } from '@/tab-presence/components/TabPresenceEffect';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { WebPushSubscriptionEffect } from '@/web-push/components/WebPushSubscriptionEffect';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const InboxEffects = () => {
  const isInboxWebPushEnabled = useIsInboxWebPushEnabled();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isImpersonating = useAtomStateValue(isImpersonatingState);
  const isInboxTabActive =
    useActiveNavigationDrawerTab() === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY;

  const isInboxAvailable = isAiChatInboxEnabled && hasAiPermission;

  return (
    <>
      <InboxThreadSyncEffect />
      <InboxChannelSyncEffect />
      {isInboxAvailable && !isImpersonating && <TabPresenceEffect />}
      {isInboxAvailable && isInboxTabActive && (
        <OnlineWorkspaceMemberIdsEffect />
      )}
      {isInboxWebPushEnabled && (
        <>
          <WebPushSubscriptionEffect />
          <InboxAppBadgeEffect />
        </>
      )}
    </>
  );
};
