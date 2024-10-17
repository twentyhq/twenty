import { createState } from 'twenty-ui';

export const isNewViewableRecordLoadingState = createState<boolean>({
  key: 'activities/is-new-viewable-record-loading',
  defaultValue: false,
});
