import { type UserEntity } from 'src/engine/core-modules/user/user.entity';

export const USER_ENTITY_NON_CACHED_PROPERTIES = [
  'formatEmail',
  'passwordHash',
  'appTokens',
  'keyValuePairs',
  'workspaceMember',
  'userWorkspaces',
  'onboardingStatus',
  'previousOnboardingStatus',
  'currentWorkspace',
  'currentUserWorkspace',
  'mustChangePassword',
] as const satisfies ReadonlyArray<keyof UserEntity>;
