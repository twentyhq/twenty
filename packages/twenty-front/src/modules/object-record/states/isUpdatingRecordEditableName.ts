import { createState } from 'twenty-ui';

export const isUpdatingRecordEditableNameState = createState<boolean>({
  key: 'isUpdatingRecordEditableNameState',
  defaultValue: false,
});
