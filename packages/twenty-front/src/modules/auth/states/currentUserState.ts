import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
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

export const currentUserState = createStateV2<CurrentUser | null>({
  key: 'currentUserState',
  defaultValue: null,
});
