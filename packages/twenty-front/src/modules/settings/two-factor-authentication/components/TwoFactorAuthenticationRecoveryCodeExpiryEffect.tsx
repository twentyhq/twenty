import { useEffect } from 'react';

const MINIMUM_DISPLAY_DURATION_MS = 5 * 60 * 1000;
const MAXIMUM_TIMEOUT_DELAY_MS = 2_147_483_647;

type TwoFactorAuthenticationRecoveryCodeExpiryEffectProps = {
  expiresAt: string;
  onExpire: () => void;
};

export const TwoFactorAuthenticationRecoveryCodeExpiryEffect = ({
  expiresAt,
  onExpire,
}: TwoFactorAuthenticationRecoveryCodeExpiryEffectProps) => {
  useEffect(() => {
    const expiryTimeoutId = setTimeout(
      onExpire,
      Math.min(
        Math.max(
          new Date(expiresAt).getTime() - Date.now(),
          MINIMUM_DISPLAY_DURATION_MS,
        ),
        MAXIMUM_TIMEOUT_DELAY_MS,
      ),
    );

    return () => clearTimeout(expiryTimeoutId);
  }, [expiresAt, onExpire]);

  return null;
};
