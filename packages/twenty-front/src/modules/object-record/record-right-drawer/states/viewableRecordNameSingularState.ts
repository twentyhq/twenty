import { createState } from 'twenty-ui/utilities';
// TODO: deprecate this state once we remove IS_COMMAND_MENU_V2_ENABLED flag
export const viewableRecordNameSingularState = createState<string | null>({
  key: 'activities/viewable-record-name-singular',
  defaultValue: null,
});
