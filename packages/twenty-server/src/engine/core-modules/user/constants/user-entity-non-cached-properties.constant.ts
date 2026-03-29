import { type UserEntity } from 'src/engine/core-modules/user/user.entity';

export const USER_ENTITY_NON_CACHED_PROPERTIES = [
  'formatEmail',
  'passwordHash',
  'appTokens',
  'keyValuePairs',
  'workspaceMember',
  'userWorkspaces',
  'onboardingStatus',
  'currentWorkspace',
  'currentUserWorkspace',
] as const satisfies ReadonlyArray<keyof UserEntity>;
