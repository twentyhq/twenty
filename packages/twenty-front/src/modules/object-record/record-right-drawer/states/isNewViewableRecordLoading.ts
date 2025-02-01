import { createState } from "twenty-shared";

export const isNewViewableRecordLoadingState = createState<boolean>({
  key: 'activities/is-new-viewable-record-loading',
  defaultValue: false,
});
