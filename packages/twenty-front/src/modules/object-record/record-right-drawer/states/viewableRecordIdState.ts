import { createState } from 'twenty-ui';

export const viewableRecordIdState = createState<string | null>({
  key: 'activities/viewable-record-id',
  defaultValue: null,
});
