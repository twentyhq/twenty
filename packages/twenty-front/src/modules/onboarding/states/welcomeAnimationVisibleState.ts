import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const welcomeAnimationVisibleState = createAtomState<boolean>({
  key: 'welcomeAnimationVisibleState',
  defaultValue: false,
});
