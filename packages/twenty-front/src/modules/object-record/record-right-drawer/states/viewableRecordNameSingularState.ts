import { createState } from "twenty-shared";

export const viewableRecordNameSingularState = createState<string | null>({
  key: 'activities/viewable-record-name-singular',
  defaultValue: null,
});
