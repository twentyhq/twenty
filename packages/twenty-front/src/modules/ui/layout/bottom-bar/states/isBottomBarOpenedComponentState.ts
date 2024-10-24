import { BottomBarInstanceContext } from '@/ui/layout/bottom-bar/states/contexts/BottomBarInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isBottomBarOpenedComponentState = createComponentStateV2<boolean>({
  key: 'isBottomBarOpenedComponentState',
  defaultValue: false,
  componentInstanceContext: BottomBarInstanceContext,
});
