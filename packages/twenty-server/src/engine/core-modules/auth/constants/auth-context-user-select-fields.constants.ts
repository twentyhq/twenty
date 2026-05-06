import { type UserEntity } from 'src/engine/core-modules/user/user.entity';

export const AUTH_CONTEXT_USER_SELECT_FIELDS = [
  'id',
  'firstName',
  'lastName',
  'email',
  'isEmailVerified',
  'disabled',
  'canImpersonate',
  'canAccessFullAdminPanel',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'locale',
] as const satisfies ReadonlyArray<keyof UserEntity>;
