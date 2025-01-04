import { createState } from '@ui/utilities/state/utils/createState';

import { User } from '~/generated/graphql';

export type CurrentUser = Pick<
  User,
  | 'id'
  | 'email'
  | 'supportUserHash'
  | 'analyticsTinybirdJwts'
  | 'canImpersonate'
  | 'onboardingStatus'
  | 'userVars'
>;

export const currentUserState = createState<CurrentUser | null>({
  key: 'currentUserState',
  defaultValue: null,
});
