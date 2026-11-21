import { useStore } from 'jotai';

import { useSwitchToNewAiChat } from '@/ai-chat/composer/hooks/useSwitchToNewAiChat';
import { inboxSelectedChannelViewSelector } from '@/inbox/states/selectors/inboxSelectedChannelViewSelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useSwitchToNewAiChatInInboxChannel = (
  params: Parameters<typeof useSwitchToNewAiChat>[0] = {},
) => {
  const store = useStore();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { switchToNewChat } = useSwitchToNewAiChat(params);

  const switchToNewChatInInboxChannel = () =>
    switchToNewChat({
      inboxChannelId: isAiChatInboxEnabled
        ? (store.get(inboxSelectedChannelViewSelector.atom)?.channelId ?? null)
        : null,
    });

  return { switchToNewChat: switchToNewChatInInboxChannel };
};
