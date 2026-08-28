import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useOpenAiChatPage = () => {
  const navigate = useNavigateApp();
  const location = useLocation();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const openAiChatPage = ({
    threadId,
  }: {
    threadId?: string | null;
  } = {}) => {
    if (isCurrentPathAiChatPage()) {
      return;
    }

    void closeSidePanelMenu();

    navigate(
      AppPath.AiChat,
      {
        threadId:
          isDefined(threadId) && isValidUuid(threadId) ? threadId : null,
      },
      undefined,
      {
        state: {
          returnLocation: `${location.pathname}${location.search}${location.hash}`,
        },
      },
    );
  };

  return { openAiChatPage };
};
