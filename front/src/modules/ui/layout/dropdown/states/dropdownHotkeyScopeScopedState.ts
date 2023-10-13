import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const dropdownHotkeyScopeScopedState = createScopedState<
  HotkeyScope | null | undefined
>({
  key: 'dropdownHotkeyScopeScopedState',
  defaultValue: null,
});
