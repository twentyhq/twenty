import { useStore } from 'jotai';
import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatChannel } from '@/metadata-store/types/FlatAgentChatChannel';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getAiChatChannelIdFromPathname } from '~/utils/getAiChatChannelIdFromPathname';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useNavigateToAiChatPage = () => {
  const store = useStore();
  const navigate = useNavigateApp();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const findThreadChannelId = (threadId: string) => {
    const threads = store.get(metadataStoreState.atomFamily('agentChatThreads'))
      .current as FlatAgentChatThread[];

    return threads.find((thread) => thread.id === threadId)?.channelId ?? null;
  };

  // Thread access and channel access are independent: a thread can be shared
  // with somebody who cannot read the private channel it sits in, and the
  // channel page has nothing to show them. Until the channels have loaded
  // there is nothing to conclude from one being absent.
  const canReadChannel = (channelId: string) => {
    const channelsStoreEntry = store.get(
      metadataStoreState.atomFamily('agentChatChannels'),
    );

    if (channelsStoreEntry.status === 'empty') {
      return true;
    }

    return (channelsStoreEntry.current as FlatAgentChatChannel[]).some(
      (channel) => channel.id === channelId,
    );
  };

  const navigateToAiChatPage = ({
    threadId,
    channelId,
  }: {
    threadId?: string | null;
    channelId?: string | null;
  } = {}) => {
    if (store.get(isLayoutCustomizationModeEnabledState.atom)) {
      return;
    }

    const threadIdParam =
      isDefined(threadId) && isValidUuid(threadId) ? threadId : null;
    const destinationChannelId =
      channelId ??
      (isDefined(threadIdParam) ? findThreadChannelId(threadIdParam) : null);
    const navigateOptions = {
      state: {
        // Read from the window rather than useLocation so that opening a new
        // chat does not require a router context from every caller of
        // useSwitchToNewAiChat, front components included.
        returnLocation: `${window.location.pathname}${window.location.search}${window.location.hash}`,
      },
    };

    // A thread of a channel opens on the channel page, beside the channel's
    // other chats; that page mirrors its selection in the URL itself.
    if (
      isDefined(destinationChannelId) &&
      canReadChannel(destinationChannelId)
    ) {
      if (
        getAiChatChannelIdFromPathname(window.location.pathname) ===
        destinationChannelId
      ) {
        return;
      }

      void closeSidePanelMenu();

      navigate(
        AppPath.AiChatChannel,
        { channelId: destinationChannelId, threadId: threadIdParam },
        undefined,
        navigateOptions,
      );

      return;
    }

    if (isCurrentPathAiChatPage()) {
      return;
    }

    void closeSidePanelMenu();

    navigate(
      AppPath.AiChat,
      { threadId: threadIdParam },
      undefined,
      navigateOptions,
    );
  };

  return { navigateToAiChatPage };
};
