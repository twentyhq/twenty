import { CustomException } from 'src/utils/custom-exception';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import {
  UserWorkspaceException,
  UserWorkspaceExceptionCode,
} from 'src/engine/core-modules/user-workspace/user-workspace.exception';

const assertIsDefinedOrThrow = (
  userWorkspace: UserWorkspace | undefined | null,
  exceptionToThrow: CustomException = new UserWorkspaceException(
    'User Workspace not found',
    UserWorkspaceExceptionCode.USER_WORKSPACE_NOT_FOUND,
  ),
): asserts userWorkspace is UserWorkspace => {
  if (!userWorkspace) {
    throw exceptionToThrow;
  }
};

export const userWorkspaceValidator: {
  assertIsDefinedOrThrow: typeof assertIsDefinedOrThrow;
} = {
  assertIsDefinedOrThrow: assertIsDefinedOrThrow,
};
