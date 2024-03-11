import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const dropdownHotkeyComponentState = createComponentState<
  HotkeyScope | null | undefined
>({
  key: 'dropdownHotkeyComponentState',
  defaultValue: null,
});
