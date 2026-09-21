import { isBreakGlassEmail } from 'src/engine/core-modules/auth/utils/is-break-glass-email.util';

describe('isBreakGlassEmail', () => {
  it('returns false for an undefined allowlist', () => {
    expect(isBreakGlassEmail('admin@dos.ai', undefined)).toBe(false);
  });

  it('returns false for an empty allowlist', () => {
    expect(isBreakGlassEmail('admin@dos.ai', '')).toBe(false);
  });

  it('returns false for an undefined or empty email', () => {
    expect(isBreakGlassEmail(undefined, 'admin@dos.ai')).toBe(false);
    expect(isBreakGlassEmail('', 'admin@dos.ai')).toBe(false);
  });

  it('matches a single allowlisted email', () => {
    expect(isBreakGlassEmail('admin@dos.ai', 'admin@dos.ai')).toBe(true);
  });

  it('matches within a comma-separated allowlist and tolerates spaces', () => {
    expect(
      isBreakGlassEmail('ops@dos.ai', 'admin@dos.ai, ops@dos.ai , dev@dos.ai'),
    ).toBe(true);
  });

  it('is case-insensitive on both sides', () => {
    expect(isBreakGlassEmail('Admin@DOS.AI', 'admin@dos.ai')).toBe(true);
    expect(isBreakGlassEmail('admin@dos.ai', 'ADMIN@DOS.AI')).toBe(true);
  });

  it('rejects emails that are not allowlisted', () => {
    expect(isBreakGlassEmail('user@example.com', 'admin@dos.ai')).toBe(false);
  });

  it('ignores empty entries in the allowlist', () => {
    expect(isBreakGlassEmail('admin@dos.ai', ',,')).toBe(false);
  });
});
