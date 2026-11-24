import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';

import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { NavigationDrawerInboxFavoritesSection } from '@/inbox/components/NavigationDrawerInboxFavoritesSection';
import { inboxFavoriteChannelsSelector } from '@/inbox/states/selectors/inboxFavoriteChannelsSelector';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { useNavigationMenuAiChatThreadClick } from '@/navigation-menu-item/display/hooks/useNavigationMenuAiChatThreadClick';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuAiChatFavoritesSectionProps = {
  headerAction?: ReactNode;
};

export const NavigationMenuAiChatFavoritesSection = ({
  headerAction,
}: NavigationMenuAiChatFavoritesSectionProps) => {
  const { t } = useLingui();
  const currentThreadId = useAiChatPageThreadId();
  const { handleThreadClick } = useNavigationMenuAiChatThreadClick();
  const inboxFavoriteThreads = useAtomStateValue(inboxFavoriteThreadsSelector);
  const inboxFavoriteChannels = useAtomStateValue(
    inboxFavoriteChannelsSelector,
  );

  return (
    <NavigationDrawerInboxFavoritesSection
      label={t`Favorite chats`}
      channels={inboxFavoriteChannels}
      threads={inboxFavoriteThreads}
      currentThreadId={currentThreadId}
      onThreadClick={handleThreadClick}
      headerAction={headerAction}
    />
  );
};
