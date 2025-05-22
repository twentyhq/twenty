import { createState } from 'twenty-ui/utilities';

export type SignInUpCallbackNewUser = {
  type: 'newUser';
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  picture?: string | null;
}

export type SignInUpCallbackExistingUser = {
  type: 'existingUser';
}

export type SignInUpCallback = { authProvider: 'google' | 'microsoft' } & (
  | SignInUpCallbackNewUser
  | SignInUpCallbackExistingUser
);

export const signInUpCallbackState = createState<SignInUpCallback | null>({
  key: 'signInUpCallback',
  defaultValue: null,
});
