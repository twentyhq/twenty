import { useLingui } from '@lingui/react/macro';

import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useExpandAskAiSidePanelPage = (): SidePanelExpandTarget => {
  const { t } = useLingui();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { navigateToAiChatPage } = useNavigateToAiChatPage();

  return {
    label: t`Expand chat`,
    disabledReason: isLayoutCustomizationModeEnabled
      ? t`Finish editing the layout to expand chat`
      : undefined,
    hasExpandShortcut: false,
    expand: () => {
      navigateToAiChatPage({ threadId: currentAiChatThread });
    },
  };
};
