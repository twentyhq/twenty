import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';

import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { useAiChatThreadClick } from '@/ai-chat/threads/hooks/useAiChatThreadClick';
import { NavigationDrawerInboxFavoritesSection } from '@/inbox/components/NavigationDrawerInboxFavoritesSection';
import { inboxFavoriteChannelsSelector } from '@/inbox/states/selectors/inboxFavoriteChannelsSelector';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type NavigationMenuAiChatFavoritesSectionProps = {
  headerAction?: ReactNode;
};

export const NavigationMenuAiChatFavoritesSection = ({
  headerAction,
}: NavigationMenuAiChatFavoritesSectionProps) => {
  const { t } = useLingui();
  const currentThreadId = useAiChatPageThreadId();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { handleThreadClick } = useAiChatThreadClick(
    isAiChatInboxEnabled
      ? { shouldOpenInFullPage: true }
      : { resetNavigationStack: true },
  );
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
