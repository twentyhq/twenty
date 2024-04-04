import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const parentHotkeyScopeForFieldScopedState = createFamilyState<
  HotkeyScope | null,
  string
>({
  key: 'parentHotkeyScopeForFieldScopedState',
  defaultValue: null,
});
