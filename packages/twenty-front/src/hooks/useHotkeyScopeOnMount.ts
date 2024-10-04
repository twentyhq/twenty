import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useEffect } from 'react';

export const useHotkeyScopeOnMount = (hotkeyScope: string) => {
  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  useEffect(() => {
    setHotkeyScopeAndMemorizePreviousScope(hotkeyScope);
    return () => {
      goBackToPreviousHotkeyScope();
    };
  }, [
    hotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  ]);
};
