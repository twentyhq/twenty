import { createState } from 'twenty-ui/utilities';

export const verifyEmailNextPathState = createState<string | undefined>({
  key: 'verifyEmailNextPathState',
  defaultValue: undefined,
});
