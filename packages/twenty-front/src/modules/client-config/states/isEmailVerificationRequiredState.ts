import { createState } from 'twenty-ui';

export const isEmailVerificationRequiredState = createState<boolean>({
  key: 'isEmailVerificationRequired',
  defaultValue: false,
});
