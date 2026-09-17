import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getAiChatChannelIdFromPathname } from '~/utils/getAiChatChannelIdFromPathname';
import { getCurrentHistoryEntryState } from '~/utils/getCurrentHistoryEntryState';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useProjectAiChatThreadToUrl = () => {
  const navigateApp = useNavigateApp();

  const projectAiChatThreadToUrl = (threadId: string) => {
    const threadIdParam = isValidUuid(threadId) ? threadId : null;
    const navigateOptions = {
      replace: true,
      state: getCurrentHistoryEntryState(),
    };
    const channelId = getAiChatChannelIdFromPathname(window.location.pathname);

    // A channel page keeps the selected thread in its own URL so the list
    // beside the chat follows it.
    if (isDefined(channelId)) {
      navigateApp(
        AppPath.AiChatChannel,
        { channelId, threadId: threadIdParam },
        undefined,
        navigateOptions,
      );

      return;
    }

    if (!isCurrentPathAiChatPage()) {
      return;
    }

    navigateApp(
      AppPath.AiChat,
      { threadId: threadIdParam },
      undefined,
      navigateOptions,
    );
  };

  return { projectAiChatThreadToUrl };
};
