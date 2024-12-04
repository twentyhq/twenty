import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { CustomException } from 'src/utils/custom-exception';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { WorkspaceAuthProvider } from 'src/engine/core-modules/workspace/types/workspace.type';

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

const isAuthEnabledOrThrow = (
  provider: WorkspaceAuthProvider,
  workspace: Workspace,
  exceptionToThrowCustom: AuthException,
) => {
  if (provider === 'google' && workspace.isGoogleAuthEnabled) return true;
  if (provider === 'microsoft' && workspace.isMicrosoftAuthEnabled) return true;
  if (provider === 'password' && workspace.isPasswordAuthEnabled) return true;

  throw exceptionToThrowCustom;
};

export const workspaceValidator: {
  assertIsExist: typeof assertIsExist;
  assertIsActive: typeof assertIsActive;
  isAuthEnabledOrThrow: typeof isAuthEnabledOrThrow;
} = {
  assertIsExist: assertIsExist,
  assertIsActive: assertIsActive,
  isAuthEnabledOrThrow: isAuthEnabledOrThrow,
};
