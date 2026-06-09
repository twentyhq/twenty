import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';

export { AUTH_CONTEXT_USER_SELECT_FIELDS } from 'src/engine/core-modules/auth/constants/auth-context-user-select-fields.constants';
export { type FlatAuthContextUser as AuthContextUser } from 'src/engine/core-modules/auth/types/flat-auth-context-user.type';

// @deprecated Use WorkspaceAuthContext instead
export type AuthContext = RawAuthContext;
