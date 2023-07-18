import { useRecoilState } from 'recoil';

import { usePreviousHotkeyScope } from '@/lib/hotkeys/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/lib/hotkeys/types/AppHotkeyScope';

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
