import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { IconSparkles } from 'twenty-ui';

export const useOpenCopilotRightDrawer = () => {
  const { openRightDrawer } = useRightDrawer();
  const setHotkeyScope = useSetHotkeyScope();

  return () => {
    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    openRightDrawer(RightDrawerPages.Copilot, {
      title: 'Copilot',
      Icon: IconSparkles,
    });
  };
};
