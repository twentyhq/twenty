import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';

describe('isValidReturnToPath', () => {
  it('should return false for empty string', () => {
    expect(isValidReturnToPath('')).toBe(false);
  });

  it('should return false for root path', () => {
    expect(isValidReturnToPath('/')).toBe(false);
  });

  it('should return false for paths not starting with slash', () => {
    expect(isValidReturnToPath('objects/people')).toBe(false);
  });

  it('should return false for double-slash paths', () => {
    expect(isValidReturnToPath('//evil.com')).toBe(false);
  });

  it('should return false for onboarding paths', () => {
    expect(isValidReturnToPath('/create/workspace')).toBe(false);
    expect(isValidReturnToPath('/create/profile')).toBe(false);
  });

  it('should return false for sign-in paths', () => {
    expect(isValidReturnToPath('/welcome')).toBe(false);
    expect(isValidReturnToPath('/verify')).toBe(false);
  });

  it('should return false for reset-password paths', () => {
    expect(isValidReturnToPath('/reset-password')).toBe(false);
  });

  it('should return true for valid application paths', () => {
    expect(isValidReturnToPath('/objects/people')).toBe(true);
    expect(isValidReturnToPath('/settings/accounts')).toBe(true);
  });
});
