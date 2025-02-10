import { isDefined } from 'twenty-shared';

import { User } from 'src/engine/core-modules/user/user.entity';
import {
  UserException,
  UserExceptionCode,
} from 'src/engine/core-modules/user/user.exception';
import { CustomException } from 'src/utils/custom-exception';
import { genericValidator } from 'src/engine/utils/assert-is-defined-or-throw';

const assertIsDefinedOrThrow = (
  user: User | undefined | null,
  exceptionToThrow: CustomException = new UserException(
    'User not found',
    UserExceptionCode.USER_NOT_FOUND,
  ),
): asserts user is User => {
  if (!isDefined(user)) {
    genericValidator.assertIsDefinedOrThrow(user, exceptionToThrow);
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
