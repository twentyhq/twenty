import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { CustomException } from 'src/utils/custom-exception';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { WorkspaceAuthProvider } from 'src/engine/core-modules/workspace/workspace.type';

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
  switch (provider) {
    case 'google':
      return workspace.isGoogleAuthEnabled;
    case 'microsoft':
      return workspace.isMicrosoftAuthEnabled;
    case 'password':
      return workspace.isPasswordAuthEnabled;
    default:
      throw exceptionToThrowCustom;
  }
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
