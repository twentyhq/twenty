import { createState } from 'twenty-ui';

export const recordPositionInternalState = createState<number | null>({
  key: 'recordPositionInternalState',
  defaultValue: null,
});
