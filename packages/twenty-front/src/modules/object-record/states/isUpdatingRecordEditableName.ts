import { createState } from "twenty-shared";

export const isUpdatingRecordEditableNameState = createState<boolean>({
  key: 'isUpdatingRecordEditableNameState',
  defaultValue: false,
});
