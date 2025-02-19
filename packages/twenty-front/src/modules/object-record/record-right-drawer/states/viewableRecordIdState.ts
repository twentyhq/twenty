import { createState } from '@ui/utilities/state/utils/createState';

export const viewableRecordIdState = createState<string | null>({
  key: 'activities/viewable-record-id',
  defaultValue: null,
});
