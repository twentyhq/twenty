import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { PositionType } from '@/action-menu/types/PositionType';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordIndexActionMenuDropdownPositionComponentState =
  createComponentState<PositionType>({
    key: 'recordIndexActionMenuDropdownPositionComponentState',
    defaultValue: {
      x: null,
      y: null,
    },
    componentInstanceContext: ActionMenuComponentInstanceContext,
  });
