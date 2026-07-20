import { isLocalApplicationVersion } from '~/pages/settings/applications/utils/isLocalApplicationVersion';

describe('isLocalApplicationVersion', () => {
  it('should be true for a locally-applied version', () => {
    expect(isLocalApplicationVersion('1.2.3 (local)')).toBe(true);
  });

  it('should be false for a plain published version', () => {
    expect(isLocalApplicationVersion('1.2.3')).toBe(false);
  });

  it('should be false when the version is missing', () => {
    expect(isLocalApplicationVersion(null)).toBe(false);
    expect(isLocalApplicationVersion(undefined)).toBe(false);
  });
});
