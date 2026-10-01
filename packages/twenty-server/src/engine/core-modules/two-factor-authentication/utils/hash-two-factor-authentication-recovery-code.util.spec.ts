import { hashTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/hash-two-factor-authentication-recovery-code.util';

describe('hashTwoFactorAuthenticationRecoveryCode', () => {
  it('returns the sha256 hex digest of the normalized code', () => {
    expect(
      hashTwoFactorAuthenticationRecoveryCode('ABCDEFGHJKMNPQRSTVWX'),
    ).toBe('8582f0401bebbf68f0492d9590c5b80f40e8f33a29c45cfd13e185b2eb4c0170');
  });

  it('ignores case, dashes and spaces', () => {
    expect(
      hashTwoFactorAuthenticationRecoveryCode('abcde-fghjk-mnpqr-stvwx'),
    ).toBe(
      hashTwoFactorAuthenticationRecoveryCode(' ABCDE FGHJK MNPQR STVWX '),
    );
  });
});
