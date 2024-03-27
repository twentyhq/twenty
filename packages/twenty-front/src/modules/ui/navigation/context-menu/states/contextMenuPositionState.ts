import { createState } from 'twenty-ui';

import { PositionType } from '@/ui/navigation/context-menu/types/PositionType';

export const contextMenuPositionState = createState<PositionType>({
  key: 'contextMenuPositionState',
  defaultValue: {
    x: null,
    y: null,
  },
});
