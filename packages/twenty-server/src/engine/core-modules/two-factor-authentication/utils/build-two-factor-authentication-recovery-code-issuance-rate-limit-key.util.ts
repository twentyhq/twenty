export const buildTwoFactorAuthenticationRecoveryCodeIssuanceRateLimitKey = ({
  actorUserId,
}: {
  actorUserId: string;
}): string => `two-factor-authentication-recovery-code-issuance:${actorUserId}`;
