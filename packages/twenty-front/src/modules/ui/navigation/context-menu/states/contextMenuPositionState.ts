import { PositionType } from '@/ui/navigation/context-menu/types/PositionType';
import { createState } from '@/ui/utilities/state/utils/createState';

export const contextMenuPositionState = createState<PositionType>({
  key: 'contextMenuPositionState',
  defaultValue: {
    x: null,
    y: null,
  },
});
