import { User } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

export type CurrentUser = Pick<
  User,
  | 'id'
  | 'email'
  | 'supportUserHash'
  | 'canAccessFullAdminPanel'
  | 'canImpersonate'
  | 'onboardingStatus'
  | 'userVars'
>;

export const currentUserState = createState<CurrentUser | null>({
  key: 'currentUserState',
  defaultValue: null,
});
