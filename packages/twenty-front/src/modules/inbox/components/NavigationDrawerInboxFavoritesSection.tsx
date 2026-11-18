import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { NavigationDrawerInboxChannelItem } from '@/inbox/components/NavigationDrawerInboxChannelItem';
import { NavigationDrawerInboxThreadItem } from '@/inbox/components/NavigationDrawerInboxThreadItem';
import { inboxChannelSummariesState } from '@/inbox/states/inboxChannelSummariesState';
import { aiChatAccessibleChannelsSelector } from '@/ai-chat/threads/states/selectors/aiChatAccessibleChannelsSelector';
import { type InboxThreadListItemData } from '@/inbox/types/InboxThreadListItemData';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type AiChatChannel } from '@/ai-chat/threads/types/AiChatChannel';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const INBOX_FAVORITES_NAVIGATION_SECTION_ID = 'AiChatFavorites';

type NavigationDrawerInboxFavoritesSectionProps = {
  channels: AiChatChannel[];
  threads: InboxThreadListItemData[];
  currentThreadId: string | null;
  onThreadClick: (thread: InboxThreadListItemData) => void;
  headerAction?: ReactNode;
};

export const NavigationDrawerInboxFavoritesSection = ({
  channels,
  threads,
  currentThreadId,
  onThreadClick,
  headerAction,
}: NavigationDrawerInboxFavoritesSectionProps) => {
  const { t } = useLingui();
  const aiChatAccessibleChannels = useAtomStateValue(
    aiChatAccessibleChannelsSelector,
  );
  const inboxChannelSummaries = useAtomStateValue(inboxChannelSummariesState);
  const canManageChannels = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );

  if (
    channels.length === 0 &&
    threads.length === 0 &&
    !isDefined(headerAction)
  ) {
    return null;
  }

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={INBOX_FAVORITES_NAVIGATION_SECTION_ID}
      label={t`Favorites`}
      rightIcon={headerAction}
      alwaysShowRightIcon={isDefined(headerAction)}
    >
      {channels.map((channel) => (
        <NavigationDrawerInboxChannelItem
          key={channel.id}
          channel={channel}
          summary={inboxChannelSummaries[channel.id]}
          destinationChannels={aiChatAccessibleChannels.filter(
            ({ id }) => id !== channel.id,
          )}
          canManage={canManageChannels}
          isExpandable={false}
        />
      ))}
      {threads.map((thread) => (
        <NavigationDrawerInboxThreadItem
          key={thread.id}
          thread={thread}
          isActive={currentThreadId === thread.id}
          onClick={onThreadClick}
        />
      ))}
    </CollapsibleNavigationDrawerSection>
  );
};
