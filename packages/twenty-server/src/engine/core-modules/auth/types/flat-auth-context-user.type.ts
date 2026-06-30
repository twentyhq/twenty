import { type AUTH_CONTEXT_USER_SELECT_FIELDS } from 'src/engine/core-modules/auth/constants/auth-context-user-select-fields.constants';
import { type FlatUser } from 'src/engine/core-modules/user/types/flat-user.type';

export type FlatAuthContextUser = Pick<
  FlatUser,
  (typeof AUTH_CONTEXT_USER_SELECT_FIELDS)[number]
>;
