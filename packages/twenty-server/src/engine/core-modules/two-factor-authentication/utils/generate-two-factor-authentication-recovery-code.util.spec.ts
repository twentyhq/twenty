import { TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ALPHABET } from 'src/engine/core-modules/two-factor-authentication/constants/two-factor-authentication-recovery-code.constant';
import { generateTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/generate-two-factor-authentication-recovery-code.util';

describe('generateTwoFactorAuthenticationRecoveryCode', () => {
  it('returns four dash-separated groups of five symbols from the alphabet', () => {
    const recoveryCode = generateTwoFactorAuthenticationRecoveryCode();

    expect(recoveryCode).toMatch(/^[0-9A-Z]{5}(-[0-9A-Z]{5}){3}$/);

    for (const symbol of recoveryCode.replace(/-/g, '')) {
      expect(TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ALPHABET).toContain(
        symbol,
      );
    }
  });
});
