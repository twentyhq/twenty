import { useLingui } from '@lingui/react/macro';

import { useOpenAiChatPage } from '@/ai/hooks/useOpenAiChatPage';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useExpandAskAiSidePanelPage = (): SidePanelExpandTarget => {
  const { t } = useLingui();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { openAiChatPage } = useOpenAiChatPage();

  return {
    label: t`Expand chat`,
    hasExpandShortcut: false,
    expand: () => {
      openAiChatPage({ threadId: currentAiChatThread });
    },
  };
};
