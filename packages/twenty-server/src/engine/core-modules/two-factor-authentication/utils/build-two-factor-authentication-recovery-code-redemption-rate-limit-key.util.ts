export const buildTwoFactorAuthenticationRecoveryCodeRedemptionRateLimitKey = ({
  userWorkspaceId,
}: {
  userWorkspaceId: string;
}): string => `two-factor-authentication-recovery-code:${userWorkspaceId}`;
