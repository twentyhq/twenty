import { useLingui } from '@lingui/react/macro';

import { NavigationDrawerInboxChannelItem } from '@/ai/components/NavigationDrawerAiChatChannelItem';
import { NavigationDrawerInboxThreadItem } from '@/ai/components/NavigationDrawerAiChatThreadItem';
import { inboxChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { inboxAccessibleChannelsSelector } from '@/ai/states/selectors/agentChatAccessibleChannelsSelector';
import { type InboxThreadListItemData } from '@/ai/types/AgentChatThreadListItem';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type AgentChatChannel } from '@/ai/types/AgentChatChannel';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const INBOX_FAVORITES_NAVIGATION_SECTION_ID = 'AiChatFavorites';

type NavigationDrawerInboxFavoritesSectionProps = {
  channels: AgentChatChannel[];
  threads: InboxThreadListItemData[];
  currentThreadId: string | null;
  onThreadClick: (thread: InboxThreadListItemData) => void;
};

export const NavigationDrawerInboxFavoritesSection = ({
  channels,
  threads,
  currentThreadId,
  onThreadClick,
}: NavigationDrawerInboxFavoritesSectionProps) => {
  const { t } = useLingui();
  const inboxAccessibleChannels = useAtomStateValue(
    inboxAccessibleChannelsSelector,
  );
  const inboxChannelSummaries = useAtomStateValue(inboxChannelSummariesState);
  const canManageChannels = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );

  if (channels.length === 0 && threads.length === 0) {
    return null;
  }

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={INBOX_FAVORITES_NAVIGATION_SECTION_ID}
      label={t`Favorites`}
    >
      {channels.map((channel) => (
        <NavigationDrawerInboxChannelItem
          key={channel.id}
          channel={channel}
          summary={inboxChannelSummaries[channel.id]}
          destinationChannels={inboxAccessibleChannels.filter(
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
