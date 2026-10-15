import { isUuidFormat } from '~/pages/settings/applications/utils/isUuidFormat';

describe('isUuidFormat', () => {
  it('accepts UUIDs of every version, in any case', () => {
    expect(isUuidFormat('f2b1c3d4-0000-4000-8000-000000000000')).toBe(true);
    expect(isUuidFormat('0198fe12-3456-7000-8000-000000000000')).toBe(true);
    expect(isUuidFormat('F2B1C3D4-0000-4000-8000-000000000000')).toBe(true);
  });

  it('rejects missing and malformed identifiers', () => {
    expect(isUuidFormat(undefined)).toBe(false);
    expect(isUuidFormat('')).toBe(false);
    expect(isUuidFormat('not-a-uuid')).toBe(false);
    expect(isUuidFormat(' f2b1c3d4-0000-4000-8000-000000000000')).toBe(false);
    expect(isUuidFormat('f2b1c3d4-0000-4000-8000-00000000000')).toBe(false);
  });
});
