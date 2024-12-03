import { PositionType } from '@/action-menu/types/PositionType';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordIndexActionMenuDropdownPositionComponentState =
  createComponentState<PositionType>({
    key: 'recordIndexActionMenuDropdownPositionComponentState',
    defaultValue: {
      x: null,
      y: null,
    },
  });
