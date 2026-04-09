import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
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

export const currentUserState = createAtomState<CurrentUser | null>({
  key: 'currentUserState',
  defaultValue: null,
});
