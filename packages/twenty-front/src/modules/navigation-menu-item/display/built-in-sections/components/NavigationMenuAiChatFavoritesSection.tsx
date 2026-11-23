import { type ReactNode } from 'react';

import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { useAiChatThreadClick } from '@/ai-chat/threads/hooks/useAiChatThreadClick';
import { NavigationDrawerInboxFavoritesSection } from '@/inbox/components/NavigationDrawerInboxFavoritesSection';
import { inboxFavoriteChannelsSelector } from '@/inbox/states/selectors/inboxFavoriteChannelsSelector';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuAiChatFavoritesSectionProps = {
  headerAction?: ReactNode;
};

export const NavigationMenuAiChatFavoritesSection = ({
  headerAction,
}: NavigationMenuAiChatFavoritesSectionProps) => {
  const currentThreadId = useAiChatPageThreadId();
  const { handleThreadClick } = useAiChatThreadClick({
    shouldOpenInFullPage: true,
  });
  const inboxFavoriteThreads = useAtomStateValue(inboxFavoriteThreadsSelector);
  const inboxFavoriteChannels = useAtomStateValue(
    inboxFavoriteChannelsSelector,
  );

  return (
    <NavigationDrawerInboxFavoritesSection
      channels={inboxFavoriteChannels}
      threads={inboxFavoriteThreads}
      currentThreadId={currentThreadId}
      onThreadClick={handleThreadClick}
      headerAction={headerAction}
    />
  );
};
