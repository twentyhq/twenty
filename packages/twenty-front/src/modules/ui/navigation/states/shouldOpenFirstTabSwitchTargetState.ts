import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const shouldOpenFirstTabSwitchTargetState = createAtomState<boolean>({
  key: 'shouldOpenFirstTabSwitchTargetState',
  defaultValue: false,
});
