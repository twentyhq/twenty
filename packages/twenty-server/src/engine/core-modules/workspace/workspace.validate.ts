import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { CustomException } from 'src/utils/custom-exception';

type WorkspaceAuthProvider = 'google' | 'microsoft' | 'password';

const assertIsExist = (
  workspace: Workspace | undefined | null,
  exceptionToThrow?: CustomException,
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

type IsAuthEnabled = <P extends WorkspaceAuthProvider>(
  provider: P,
  exceptionToThrow: CustomException,
) => (
  workspace: Workspace,
  exceptionToThrowCustom?: CustomException,
) => boolean;

const isAuthEnabled: IsAuthEnabled = (provider, exceptionToThrow) => {
  return (workspace, exceptionToThrowCustom = exceptionToThrow) => {
    if (provider === 'google' && workspace.isGoogleAuthEnabled) return true;
    if (provider === 'microsoft' && workspace.isMicrosoftAuthEnabled)
      return true;
    if (provider === 'password' && workspace.isPasswordAuthEnabled) return true;

    if (exceptionToThrowCustom) {
      throw exceptionToThrowCustom;
    }

    return false;
  };
};

const validateAuth = (fn: ReturnType<IsAuthEnabled>, workspace: Workspace) =>
  fn(workspace);

export const workspaceValidator: {
  assertIsExist: typeof assertIsExist;
  assertIsActive: typeof assertIsActive;
  isAuthEnabled: IsAuthEnabled;
  validateAuth: typeof validateAuth;
} = {
  assertIsExist: assertIsExist,
  assertIsActive: assertIsActive,
  isAuthEnabled,
  validateAuth,
};
