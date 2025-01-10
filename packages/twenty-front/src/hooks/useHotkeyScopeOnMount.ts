import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useEffect } from 'react';

/**
 * @deprecated This hook uses useEffect
 * Use event handlers and imperative code to manage hotkey scope changes.
 */
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
