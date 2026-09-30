import { hashTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/hash-two-factor-authentication-recovery-code.util';

describe('hashTwoFactorAuthenticationRecoveryCode', () => {
  it('ignores case, dashes and spaces', () => {
    expect(
      hashTwoFactorAuthenticationRecoveryCode('abcde-fghjk-mnpqr-stvwx'),
    ).toBe(
      hashTwoFactorAuthenticationRecoveryCode(' ABCDE FGHJK MNPQR STVWX '),
    );
  });
});
