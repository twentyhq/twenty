import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';

import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { askAiSidePanelThreadIdComponentState } from '@/side-panel/pages/ask-ai/states/askAiSidePanelThreadIdComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useExpandAskAiSidePanelPage = (): SidePanelExpandTarget => {
  const { t } = useLingui();
  const store = useStore();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;
  const { navigateToAiChatPage } = useNavigateToAiChatPage();

  return {
    label: t`Expand chat`,
    disabledReason: isLayoutCustomizationModeEnabled
      ? t`Finish editing the layout to expand chat`
      : undefined,
    hasExpandShortcut: false,
    expand: () => {
      const askAiSidePanelThreadId = store.get(
        askAiSidePanelThreadIdComponentState.atomFamily({
          instanceId: sidePanelPageInstanceId ?? '',
        }),
      );

      const isOnNewChat =
        askAiSidePanelThreadId === store.get(newAiChatThreadIdState.atom);

      navigateToAiChatPage({
        threadId: isOnNewChat ? null : askAiSidePanelThreadId,
      });
    },
  };
};
