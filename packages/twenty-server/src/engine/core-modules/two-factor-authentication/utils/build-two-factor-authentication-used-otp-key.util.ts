export const buildTwoFactorAuthenticationUsedOtpKey = ({
  methodId,
  token,
}: {
  methodId: string;
  token: string;
}): string => `two-factor-authentication-used-otp:${methodId}:${token}`;
