import { isMicrosoftOAuthTransientError } from 'src/engine/core-modules/auth/utils/is-microsoft-oauth-transient-error.util';

describe('isMicrosoftOAuthTransientError', () => {
  it('should detect AADSTS650051 in the error message', () => {
    const error = new Error(
      'AADSTS650051: The application needs to be provisioned for this tenant.',
    );

    expect(isMicrosoftOAuthTransientError(error)).toBe(true);
  });

  it('should reject other errors and non-Error values', () => {
    expect(isMicrosoftOAuthTransientError(new Error('invalid_client'))).toBe(
      false,
    );
    expect(isMicrosoftOAuthTransientError('AADSTS650051')).toBe(false);
    expect(isMicrosoftOAuthTransientError(null)).toBe(false);
  });
});
