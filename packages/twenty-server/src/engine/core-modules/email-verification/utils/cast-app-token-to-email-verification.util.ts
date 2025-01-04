import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  EmailVerificationException,
  EmailVerificationExceptionCode,
} from 'src/engine/core-modules/email-verification/email-verification.exception';

export const castAppTokenToEmailVerification = (appToken: AppToken) => {
  if (appToken.type !== AppTokenType.EmailVerificationToken) {
    throw new EmailVerificationException(
      'Invalid token type',
      EmailVerificationExceptionCode.INVALID_APP_TOKEN_TYPE,
    );
  }

  if (new Date() > appToken.expiresAt) {
    throw new EmailVerificationException(
      'Token expired',
      EmailVerificationExceptionCode.TOKEN_EXPIRED,
    );
  }

  if (!appToken.userId) {
    throw new EmailVerificationException(
      `Email verification corrupted: Missing user id in token`,
      EmailVerificationExceptionCode.EMAIL_VERIFICATION_CORRUPTED,
    );
  }

  return {
    id: appToken.id,
    userId: appToken.userId,
    expiresAt: appToken.expiresAt,
  };
};
