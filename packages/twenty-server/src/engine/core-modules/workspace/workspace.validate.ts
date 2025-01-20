import { WorkspaceActivationStatus } from 'twenty-shared';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { WorkspaceAuthProvider } from 'src/engine/core-modules/workspace/types/workspace.type';
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

const assertIsActive = (
  workspace: Workspace,
  exceptionToThrow: CustomException,
): asserts workspace is Workspace & {
  activationStatus: WorkspaceActivationStatus.ACTIVE;
} => {
  if (workspace.activationStatus === WorkspaceActivationStatus.ACTIVE) return;
  throw exceptionToThrow;
};

const isAuthEnabledOrThrow = (
  provider: WorkspaceAuthProvider,
  workspace: Workspace,
  exceptionToThrowCustom: AuthException = new AuthException(
    `${provider} auth is not enabled for this workspace`,
    AuthExceptionCode.OAUTH_ACCESS_DENIED,
  ),
) => {
  if (provider === 'google' && workspace.isGoogleAuthEnabled) return true;
  if (provider === 'microsoft' && workspace.isMicrosoftAuthEnabled) return true;
  if (provider === 'password' && workspace.isPasswordAuthEnabled) return true;
  if (provider === 'sso') return true;

  throw exceptionToThrowCustom;
};

export const workspaceValidator: {
  assertIsDefinedOrThrow: typeof assertIsDefinedOrThrow;
  assertIsActive: typeof assertIsActive;
  isAuthEnabledOrThrow: typeof isAuthEnabledOrThrow;
} = {
  assertIsDefinedOrThrow: assertIsDefinedOrThrow,
  assertIsActive: assertIsActive,
  isAuthEnabledOrThrow: isAuthEnabledOrThrow,
};
