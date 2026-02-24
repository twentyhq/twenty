import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isEmailVerificationRequiredState = createState<boolean>({
  key: 'isEmailVerificationRequired',
  defaultValue: false,
});
