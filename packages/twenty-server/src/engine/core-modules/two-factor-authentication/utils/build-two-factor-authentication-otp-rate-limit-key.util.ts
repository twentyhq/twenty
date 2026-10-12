export const buildTwoFactorAuthenticationOtpRateLimitKey = ({
  userId,
  workspaceId,
}: {
  userId: string;
  workspaceId: string;
}): string => `two-factor-authentication-otp:${userId}:${workspaceId}`;
