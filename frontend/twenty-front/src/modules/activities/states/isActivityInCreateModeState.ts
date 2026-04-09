import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isActivityInCreateModeState = createAtomState<boolean>({
  key: 'isActivityInCreateModeState',
  defaultValue: false,
});
