import { User } from 'src/engine/core-modules/user/user.entity';
import { CustomException } from 'src/utils/custom-exception';

const assertIsExist = (
  user: User | undefined | null,
  exceptionToThrow: CustomException,
): asserts user is User => {
  if (!user) {
    throw exceptionToThrow;
  }
};

const isExist = (user: User | undefined | null): user is User => {
  return !!user;
};

const assertHasDefaultWorkspace = (
  user: User,
  exceptionToThrow?: CustomException,
): asserts user is User & { defaultWorkspaceId: string } => {
  if (!user.defaultWorkspaceId) {
    throw exceptionToThrow;
  }
};

export const userValidator: {
  assertIsExist: typeof assertIsExist;
  assertHasDefaultWorkspace: typeof assertHasDefaultWorkspace;
  isExist: typeof isExist;
} = {
  assertIsExist,
  assertHasDefaultWorkspace,
  isExist,
};
