import { AppPath } from 'twenty-shared/types';
import { isValidUuid } from 'twenty-shared/utils';

import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getCurrentHistoryEntryState } from '~/utils/getCurrentHistoryEntryState';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useProjectAiChatThreadToUrl = () => {
  const navigateApp = useNavigateApp();

  const projectAiChatThreadToUrl = (threadId: string) => {
    if (!isCurrentPathAiChatPage()) {
      return;
    }

    navigateApp(
      AppPath.AiChat,
      { threadId: isValidUuid(threadId) ? threadId : null },
      undefined,
      { replace: true, state: getCurrentHistoryEntryState() },
    );
  };

  return { projectAiChatThreadToUrl };
};
