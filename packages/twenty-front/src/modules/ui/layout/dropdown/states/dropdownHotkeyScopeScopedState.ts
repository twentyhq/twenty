import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const dropdownHotkeyScopeScopedState = createStateScopeMap<
  HotkeyScope | null | undefined
>({
  key: 'dropdownHotkeyScopeScopedState',
  defaultValue: null,
});
