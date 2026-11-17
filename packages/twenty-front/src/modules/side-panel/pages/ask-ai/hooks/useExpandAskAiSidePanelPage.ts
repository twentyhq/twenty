import { useLingui } from '@lingui/react/macro';

import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useAskAiSidePanelThreadId } from '@/side-panel/pages/ask-ai/hooks/useAskAiSidePanelThreadId';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useExpandAskAiSidePanelPage = (): SidePanelExpandTarget => {
  const { t } = useLingui();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const askAiSidePanelThreadId = useAskAiSidePanelThreadId();
  const { navigateToAiChatPage } = useNavigateToAiChatPage();

  return {
    label: t`Expand chat`,
    disabledReason: isLayoutCustomizationModeEnabled
      ? t`Finish editing the layout to expand chat`
      : undefined,
    hasExpandShortcut: false,
    expand: () => {
      navigateToAiChatPage({ threadId: askAiSidePanelThreadId });
    },
  };
};
