import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const isAuthEnabledOrThrow = (
  provider: AuthProviderEnum,
  workspace: WorkspaceEntity,
  exceptionToThrowCustom: AuthException = new AuthException(
    `${provider} auth is not enabled for this workspace`,
    AuthExceptionCode.OAUTH_ACCESS_DENIED,
  ),
) => {
  if (provider === AuthProviderEnum.Google && workspace.isGoogleAuthEnabled)
    return true;
  if (
    provider === AuthProviderEnum.Microsoft &&
    workspace.isMicrosoftAuthEnabled
  )
    return true;
  if (provider === AuthProviderEnum.Password && workspace.isPasswordAuthEnabled)
    return true;
  if (provider === AuthProviderEnum.SSO) return true;

  throw exceptionToThrowCustom;
};

const isAuthEnabled = (
  provider: AuthProviderEnum,
  workspace: WorkspaceEntity,
) => {
  if (provider === AuthProviderEnum.Google && workspace.isGoogleAuthEnabled)
    return true;
  if (
    provider === AuthProviderEnum.Microsoft &&
    workspace.isMicrosoftAuthEnabled
  )
    return true;
  if (provider === AuthProviderEnum.Password && workspace.isPasswordAuthEnabled)
    return true;

  return false;
};

export const workspaceValidator: {
  isAuthEnabledOrThrow: typeof isAuthEnabledOrThrow;
  isAuthEnabled: typeof isAuthEnabled;
} = {
  isAuthEnabledOrThrow: isAuthEnabledOrThrow,
  isAuthEnabled: isAuthEnabled,
};
