import { createState } from 'twenty-ui';

export enum SignInUpMode {
  SignIn = 'sign-in',
  SignUp = 'sign-up',
}

export const signInUpModeState = createState<SignInUpMode>({
  key: 'signInUpModeState',
  defaultValue: SignInUpMode.SignIn,
});
