import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { type PositionType } from '@/action-menu/types/PositionType';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordIndexActionMenuDropdownPositionComponentState =
  createComponentStateV2<PositionType>({
    key: 'recordIndexActionMenuDropdownPositionComponentState',
    defaultValue: {
      x: null,
      y: null,
    },
    componentInstanceContext: ActionMenuComponentInstanceContext,
  });
