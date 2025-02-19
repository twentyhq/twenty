import { createState } from '@ui/utilities/state/utils/createState';

export const isNewViewableRecordLoadingState = createState<boolean>({
  key: 'activities/is-new-viewable-record-loading',
  defaultValue: false,
});
