import { createState } from '@ui/utilities/state/utils/createState';

export const viewableRecordNameSingularState = createState<string | null>({
  key: 'activities/viewable-record-name-singular',
  defaultValue: null,
});
