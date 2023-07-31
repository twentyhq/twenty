import { useRecoilState } from 'recoil';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';

import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';

export function useCommandMenu() {
  const [, setIsCommandMenuOpenedState] = useRecoilState(
    isCommandMenuOpenedState,
  );
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  function openCommandMenu() {
    setIsCommandMenuOpenedState(true);
    setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenu);
  }

  function closeCommandMenu() {
    setIsCommandMenuOpenedState(false);
    goBackToPreviousHotkeyScope();
  }

  return {
    openCommandMenu,
    closeCommandMenu,
  };
}
