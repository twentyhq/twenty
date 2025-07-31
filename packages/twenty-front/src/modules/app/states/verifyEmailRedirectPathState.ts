import { createState } from 'twenty-ui/utilities';

export const verifyEmailRedirectPathState = createState<string | undefined>({
  key: 'verifyEmailRedirectPathState',
  defaultValue: undefined,
});
