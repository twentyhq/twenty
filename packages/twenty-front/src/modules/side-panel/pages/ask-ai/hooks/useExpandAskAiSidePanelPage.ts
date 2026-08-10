import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useExpandAskAiSidePanelPage = (): SidePanelExpandTarget | null => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const navigate = useNavigateApp();
  const location = useLocation();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { closeSidePanelMenu } = useSidePanelMenu();

  if (isMobile) {
    return null;
  }

  return {
    label: t`Expand chat`,
    hasExpandShortcut: false,
    expand: () => {
      void closeSidePanelMenu();

      navigate(
        AppPath.AiChat,
        {
          threadId:
            isDefined(currentAiChatThread) && isValidUuid(currentAiChatThread)
              ? currentAiChatThread
              : null,
        },
        undefined,
        {
          state: {
            returnLocation: `${location.pathname}${location.search}${location.hash}`,
          },
        },
      );
    },
  };
};
