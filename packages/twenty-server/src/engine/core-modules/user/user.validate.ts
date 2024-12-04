import { User } from 'src/engine/core-modules/user/user.entity';
import { CustomException } from 'src/utils/custom-exception';
import { isDefined } from 'src/utils/is-defined';

const assertIsDefinedOrThrow = (
  user: User | undefined | null,
  exceptionToThrow: CustomException,
): asserts user is User => {
  if (!isDefined(user)) {
    throw exceptionToThrow;
  }
};

const isExist = (user: User | undefined | null): user is User => {
  return isDefined(user);
};

const assertHasDefaultWorkspaceOrThrow = (
  user: User,
  exceptionToThrow?: CustomException,
): asserts user is User & { defaultWorkspaceId: string } => {
  if (!isDefined(user.defaultWorkspaceId)) {
    throw exceptionToThrow;
  }
};

export const userValidator: {
  assertIsDefinedOrThrow: typeof assertIsDefinedOrThrow;
  assertHasDefaultWorkspace: typeof assertHasDefaultWorkspaceOrThrow;
  isExist: typeof isExist;
} = {
  assertIsDefinedOrThrow: assertIsDefinedOrThrow,
  assertHasDefaultWorkspace: assertHasDefaultWorkspaceOrThrow,
  isExist,
};
