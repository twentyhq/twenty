import { useLingui } from '@lingui/react/macro';

import { useNavigateToInboxThreadPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useExpandAskAiSidePanelPage = (): SidePanelExpandTarget => {
  const { t } = useLingui();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const { navigateToInboxThreadPage } = useNavigateToInboxThreadPage();

  return {
    label: t`Expand chat`,
    disabledReason: isLayoutCustomizationModeEnabled
      ? t`Finish editing the layout to expand chat`
      : undefined,
    hasExpandShortcut: false,
    expand: () => {
      navigateToInboxThreadPage({ threadId: currentInboxThread });
    },
  };
};
