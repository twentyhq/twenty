import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isWelcomeAnimationLeavingState = createAtomState<boolean>({
  key: 'isWelcomeAnimationLeavingState',
  defaultValue: false,
});
