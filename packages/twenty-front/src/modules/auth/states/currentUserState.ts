import { createState } from '@/ui/utilities/state/utils/createState';
import { type User } from '~/generated-metadata/graphql';

export type CurrentUser = Pick<
  User,
  | 'id'
  | 'email'
  | 'supportUserHash'
  | 'canAccessFullAdminPanel'
  | 'canImpersonate'
  | 'onboardingStatus'
  | 'userVars'
  | 'firstName'
  | 'lastName'
  | 'hasPassword'
>;

export const currentUserState = createState<CurrentUser | null>({
  key: 'currentUserState',
  defaultValue: null,
});
