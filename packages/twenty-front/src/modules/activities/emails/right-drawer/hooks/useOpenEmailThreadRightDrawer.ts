import {
  RightDrawerHotkeyScope,
  RightDrawerPages,
  useRightDrawer,
  useSetHotkeyScope,
} from 'twenty-ui';

export const useOpenEmailThreadRightDrawer = () => {
  const { openRightDrawer } = useRightDrawer();
  const setHotkeyScope = useSetHotkeyScope();

  return () => {
    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    openRightDrawer(RightDrawerPages.ViewEmailThread);
  };
};
