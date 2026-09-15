import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isWelcomeAnimationVisibleState = createAtomState<boolean>({
  key: 'isWelcomeAnimationVisibleState',
  defaultValue: false,
});
