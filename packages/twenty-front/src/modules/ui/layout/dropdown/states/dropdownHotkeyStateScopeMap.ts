import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const dropdownHotkeyStateScopeMap = createStateScopeMap<
  HotkeyScope | null | undefined
>({
  key: 'dropdownHotkeyStateScopeMap',
  defaultValue: null,
});
