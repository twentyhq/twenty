import { createState } from 'twenty-ui/utilities';
import { type AuthToken } from '~/generated-metadata/graphql';

export const loginTokenState = createState<AuthToken['token'] | null>({
  key: 'loginTokenState',
  defaultValue: null,
});
