import { isDefined } from 'twenty-shared/utils';

import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import {
  UserException,
  UserExceptionCode,
} from 'src/engine/core-modules/user/user.exception';
import { type CustomException } from 'src/utils/custom-exception';

const assertIsDefinedOrThrow = (
  user: UserEntity | undefined | null,
  exceptionToThrow: CustomException = new UserException(
    'UserEntity not found',
    UserExceptionCode.USER_NOT_FOUND,
  ),
): asserts user is UserEntity => {
  if (!isDefined(user)) {
    throw exceptionToThrow;
  }
};

const isUserDefined = (
  user: UserEntity | undefined | null,
): user is UserEntity => {
  return isDefined(user);
};

export const userValidator: {
  assertIsDefinedOrThrow: typeof assertIsDefinedOrThrow;
  isDefined: typeof isUserDefined;
} = {
  assertIsDefinedOrThrow,
  isDefined: isUserDefined,
};
