import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
// TODO: deprecate this state once we remove IS_COMMAND_MENU_V2_ENABLED flag
export const viewableRecordNameSingularState = createAtomState<string | null>({
  key: 'activities/viewable-record-name-singular',
  defaultValue: null,
});
