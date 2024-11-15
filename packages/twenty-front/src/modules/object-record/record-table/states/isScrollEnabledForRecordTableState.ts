import { createState } from 'twenty-ui';

export type ScrollEnabled = {
  enableXScroll: boolean;
  enableYScroll: boolean;
};

export const isScrollEnabledForRecordTableState = createState<ScrollEnabled>({
  key: 'isScrollEnabledForRecordTableState',
  defaultValue: {
    enableXScroll: true,
    enableYScroll: true,
  },
});
