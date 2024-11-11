import { createState } from 'twenty-ui';
type isScrollEnabledForRecordTableStateType = {
  enableXScroll: boolean;
  enableYScroll: boolean;
};
export const isScrollEnabledForRecordTableState =
  createState<isScrollEnabledForRecordTableStateType>({
    key: 'isScrollEnabledForRecordTableState',
    defaultValue: {
      enableXScroll: true,
      enableYScroll: true,
    },
  });
