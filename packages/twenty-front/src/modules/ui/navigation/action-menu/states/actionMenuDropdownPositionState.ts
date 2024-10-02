import { PositionType } from '@/ui/navigation/action-menu/types/PositionType';
import { createState } from 'twenty-ui';

export const actionMenuDropdownPositionState = createState<PositionType>({
  key: 'actionMenuDropdownPositionState',
  defaultValue: {
    x: null,
    y: null,
  },
});
