import { CustomException } from "src/utils/custom-exception";
import { TwoFactorAuthenticationMethod } from "./entities/two-factor-authentication-method.entity";
import { UserException } from "../user/user.exception";
import { TwoFactorAuthenticationException, TwoFactorAuthenticationExceptionCode } from "./two-factor-authentication.exception";
import { isDefined } from "twenty-shared/utils";

const assertIsDefinedOrThrow = (
  twoFactorAuthenticationMethod: TwoFactorAuthenticationMethod | undefined | null,
  exceptionToThrow: CustomException = new TwoFactorAuthenticationException(
    'User not found',
    TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_NOT_FOUND,
  ),
): asserts twoFactorAuthenticationMethod is TwoFactorAuthenticationMethod => {
  if (!isDefined(twoFactorAuthenticationMethod)) {
    throw exceptionToThrow;
  }
};

const isTwoFactorAuthenticationMethodDefined = (
  twoFactorAuthenticationMethod: TwoFactorAuthenticationMethod | undefined | null
): twoFactorAuthenticationMethod is TwoFactorAuthenticationMethod => {
  return isDefined(twoFactorAuthenticationMethod);
};

export const twoFactorAuthenticationMethodValidator: {
  assertIsDefinedOrThrow: typeof assertIsDefinedOrThrow;
  isDefined: typeof isTwoFactorAuthenticationMethodDefined;
} = {
  assertIsDefinedOrThrow,
  isDefined: isTwoFactorAuthenticationMethodDefined,
};
