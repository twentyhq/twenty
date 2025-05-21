import { createState } from 'twenty-ui/utilities';

export const signInUpCallbackState = createState<
  | ({ authProvider: 'google' | 'microsoft' } & (
      | {
          newUser: {
            email: string;
            firstName?: string | null;
            lastName?: string | null;
            picture?: string | null;
          };
        }
      | {
          existingUser: {
            email: string;
          };
        }
    ))
  | null
>({
  key: 'signInUpCallback',
  defaultValue: null,
});
