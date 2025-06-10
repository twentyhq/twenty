import { isDefined } from 'twenty-shared/utils';

import { User } from 'src/engine/core-modules/user/user.entity';
import {
  UserException,
  UserExceptionCode,
} from 'src/engine/core-modules/user/user.exception';
import { CustomException } from 'src/utils/custom-exception';

const assertIsDefinedOrThrow = (
  user: User | undefined | null,
  exceptionToThrow: CustomException = new UserException(
    'User not found',
    UserExceptionCode.USER_NOT_FOUND,
  ),
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
