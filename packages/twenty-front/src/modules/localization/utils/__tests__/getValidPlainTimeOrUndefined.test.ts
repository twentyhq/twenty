import { getValidPlainTimeOrUndefined } from '@/localization/utils/getValidPlainTimeOrUndefined';

describe('getValidPlainTimeOrUndefined', () => {
  it('should parse times with or without seconds', () => {
    expect(getValidPlainTimeOrUndefined('09:30')?.toString()).toBe('09:30:00');
    expect(getValidPlainTimeOrUndefined('18:00:00')?.toString()).toBe(
      '18:00:00',
    );
  });

  it('should return undefined for an empty or malformed time', () => {
    expect(getValidPlainTimeOrUndefined('')).toBeUndefined();
    expect(getValidPlainTimeOrUndefined('25:00')).toBeUndefined();
    expect(getValidPlainTimeOrUndefined('not a time')).toBeUndefined();
  });
});
