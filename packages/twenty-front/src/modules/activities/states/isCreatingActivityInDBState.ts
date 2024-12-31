import { createState } from '@ui/utilities/state/utils/createState';

export const isUpsertingActivityInDBState = createState<boolean>({
  key: 'isUpsertingActivityInDBState',
  defaultValue: false,
});
