import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isDeveloperDefaultSignInPrefilledState = createAtomState<boolean>({
  key: 'isDeveloperDefaultSignInPrefilledState',
  defaultValue: false,
});
