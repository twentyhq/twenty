import { createState } from 'twenty-ui/utilities';
import { AuthToken } from '~/generated/graphql';

export const loginTokenState = createState<AuthToken['token'] | null>({
  key: 'loginTokenState',
  defaultValue: null,
});
