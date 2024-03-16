import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const customEditHotkeyScopeForFieldScopedState = createFamilyState<
  HotkeyScope | null,
  string
>({
  key: 'customEditHotkeyScopeForFieldScopedState',
  defaultValue: null,
});
