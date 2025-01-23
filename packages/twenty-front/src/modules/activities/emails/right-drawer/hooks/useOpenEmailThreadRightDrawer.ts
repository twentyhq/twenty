import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { IconMail } from 'twenty-ui';

export const useOpenEmailThreadRightDrawer = () => {
  const { openRightDrawer } = useRightDrawer();
  const setHotkeyScope = useSetHotkeyScope();

  return () => {
    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    openRightDrawer(RightDrawerPages.ViewEmailThread, {
      title: 'Email Thread',
      Icon: IconMail,
    });
  };
};
