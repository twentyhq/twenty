import { PositionType } from '@/ui/navigation/action-menu/types/PositionType';
import { createState } from 'twenty-ui';

export const contextMenuPositionState = createState<PositionType>({
  key: 'contextMenuPositionState',
  defaultValue: {
    x: null,
    y: null,
  },
});
