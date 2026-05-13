import { isValidReturnToPath } from 'src/engine/core-modules/auth/utils/is-valid-return-to-path.util';

describe('isValidReturnToPath', () => {
  it('rejects empty / non-string / null', () => {
    expect(isValidReturnToPath('')).toBe(false);
    expect(isValidReturnToPath(undefined)).toBe(false);
    expect(isValidReturnToPath(null)).toBe(false);
    expect(isValidReturnToPath(42)).toBe(false);
  });

  it('rejects the bare root path', () => {
    expect(isValidReturnToPath('/')).toBe(false);
  });

  it('rejects relative paths', () => {
    expect(isValidReturnToPath('objects/people')).toBe(false);
  });

  it('rejects protocol-relative URLs (open-redirect guard)', () => {
    expect(isValidReturnToPath('//evil.com')).toBe(false);
    expect(isValidReturnToPath('//evil.com/path')).toBe(false);
  });

  it('accepts in-app paths', () => {
    expect(isValidReturnToPath('/objects/people')).toBe(true);
    expect(isValidReturnToPath('/settings/accounts')).toBe(true);
  });

  it('accepts OAuth /authorize with query parameters', () => {
    expect(
      isValidReturnToPath(
        '/authorize?response_type=code&client_id=abc&redirect_uri=https%3A%2F%2Fclient.example.com%2Fcb&state=xyz',
      ),
    ).toBe(true);
  });
});
