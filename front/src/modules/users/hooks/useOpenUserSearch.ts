import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

export function useOpenUserSearch() {
  const setHotkeyScope = useSetHotkeyScope();

  return () => {
    setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
  };
}
