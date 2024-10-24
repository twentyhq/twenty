import { BottomBarInstanceContext } from '@/ui/layout/bottom-bar/states/contexts/BottomBarInstanceContext';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const bottomBarHotkeyComponentState = createComponentStateV2<
  HotkeyScope | null | undefined
>({
  key: 'bottomBarHotkeyComponentState',
  defaultValue: null,
  componentInstanceContext: BottomBarInstanceContext,
});
