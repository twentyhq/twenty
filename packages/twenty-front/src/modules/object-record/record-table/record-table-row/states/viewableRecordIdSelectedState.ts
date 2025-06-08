import { createState } from 'twenty-ui/utilities';
export const viewableRecordIdSelectedState = createState<string | null>({
  key: 'record-table/viewable-record-id-selected',
  defaultValue: null,
});
