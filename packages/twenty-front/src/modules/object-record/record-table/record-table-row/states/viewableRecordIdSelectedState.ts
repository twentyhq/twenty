import { createState } from 'twenty-ui/utilities';
export const viewableRecordIdSelectedState = createState<string | null>({
  key: 'activities/viewable-record-id-selected',
  defaultValue: null,
});
