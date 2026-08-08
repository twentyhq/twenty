import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isValidUuid } from 'twenty-shared/utils';

import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

// The chat page's URL names the selected thread, so every operation that
// changes the selection writes the URL here, in the same call. The URL is a
// projection of the selection and nothing observes the selection to rewrite
// it, so the two cannot chase each other. Elsewhere the URL names a record or
// a view and the selection stays ambient, so this is a no-op.
export const useProjectAiChatThreadToUrl = () => {
  const navigateApp = useNavigateApp();
  const { state: locationState } = useLocation();

  const projectAiChatThreadToUrl = (threadId: string) => {
    if (!isCurrentPathAiChatPage()) {
      return;
    }

    // Carrying the entry's state forward keeps the location the chat was
    // expanded from, so collapsing still returns there after a thread switch.
    navigateApp(
      AppPath.AiChat,
      { threadId: isValidUuid(threadId) ? threadId : null },
      undefined,
      { replace: true, state: locationState },
    );
  };

  return { projectAiChatThreadToUrl };
};
