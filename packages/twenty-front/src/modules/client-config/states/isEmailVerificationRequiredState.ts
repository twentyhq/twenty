import { createState } from '@/ui/utilities/state/utils/createState';
export const isEmailVerificationRequiredState = createState<boolean>({
  key: 'isEmailVerificationRequired',
  defaultValue: false,
});
