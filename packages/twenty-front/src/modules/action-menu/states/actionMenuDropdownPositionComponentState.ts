import { PositionType } from '@/action-menu/types/PositionType';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const actionMenuDropdownPositionComponentState =
  createComponentState<PositionType>({
    key: 'actionMenuDropdownPositionComponentState',
    defaultValue: {
      x: null,
      y: null,
    },
  });
