import { hashTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/hash-two-factor-authentication-recovery-code.util';

describe('hashTwoFactorAuthenticationRecoveryCode', () => {
  it('ignores case, dashes and spaces', () => {
    expect(
      hashTwoFactorAuthenticationRecoveryCode('abcde-fghjk-mnpqr-stvwx'),
    ).toBe(
      hashTwoFactorAuthenticationRecoveryCode(' ABCDE FGHJK MNPQR STVWX '),
    );
  });

  it('returns a sha256 hex digest that differs per code', () => {
    const hash = hashTwoFactorAuthenticationRecoveryCode(
      'ABCDE-FGHJK-MNPQR-STVWX',
    );

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toBe(
      hashTwoFactorAuthenticationRecoveryCode('ABCDE-FGHJK-MNPQR-STVWY'),
    );
  });
});
