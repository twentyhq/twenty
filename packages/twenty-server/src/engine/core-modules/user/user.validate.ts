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

const isUserDefined = (user: User | undefined | null): user is User => {
  return isDefined(user);
};

export const userValidator: {
  assertIsDefinedOrThrow: typeof assertIsDefinedOrThrow;
  isDefined: typeof isUserDefined;
} = {
  assertIsDefinedOrThrow,
  isDefined: isUserDefined,
};
