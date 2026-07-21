import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isWelcomeTitleHandoffTargetReadyState = createAtomState<boolean>({
  key: 'isWelcomeTitleHandoffTargetReadyState',
  defaultValue: false,
});
