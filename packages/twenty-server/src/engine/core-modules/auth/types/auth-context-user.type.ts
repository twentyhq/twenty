import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type AUTH_CONTEXT_USER_SELECT_FIELDS } from 'src/engine/core-modules/auth/constants/auth-context-user-select-fields.constants';

export type AuthContextUser = Pick<
  UserEntity,
  (typeof AUTH_CONTEXT_USER_SELECT_FIELDS)[number]
>;
