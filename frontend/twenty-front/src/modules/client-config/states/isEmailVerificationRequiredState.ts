import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isEmailVerificationRequiredState = createAtomState<boolean>({
  key: 'isEmailVerificationRequired',
  defaultValue: false,
});
