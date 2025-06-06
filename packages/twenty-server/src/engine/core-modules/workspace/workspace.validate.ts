import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { CustomException } from 'src/utils/custom-exception';

const assertIsDefinedOrThrow = (
  workspace: Workspace | undefined | null,
  exceptionToThrow: CustomException = new WorkspaceException(
    'Workspace not found',
    WorkspaceExceptionCode.WORKSPACE_NOT_FOUND,
  ),
): asserts workspace is Workspace => {
  if (!workspace) {
    throw exceptionToThrow;
  }
};

const isAuthEnabledOrThrow = (
  provider: AuthProviderEnum,
  workspace: Workspace,
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

const isAuthEnabled = (provider: AuthProviderEnum, workspace: Workspace) => {
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
  assertIsDefinedOrThrow: typeof assertIsDefinedOrThrow;
  isAuthEnabledOrThrow: typeof isAuthEnabledOrThrow;
  isAuthEnabled: typeof isAuthEnabled;
} = {
  assertIsDefinedOrThrow: assertIsDefinedOrThrow,
  isAuthEnabledOrThrow: isAuthEnabledOrThrow,
  isAuthEnabled: isAuthEnabled,
};
