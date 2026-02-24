import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
// TODO: deprecate this state once we remove IS_COMMAND_MENU_V2_ENABLED flag
export const viewableRecordNameSingularState = createStateV2<string | null>({
  key: 'activities/viewable-record-name-singular',
  defaultValue: null,
});
