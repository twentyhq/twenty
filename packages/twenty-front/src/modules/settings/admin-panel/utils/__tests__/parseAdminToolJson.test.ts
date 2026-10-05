import { parseAdminToolJson } from '@/settings/admin-panel/utils/parseAdminToolJson';

describe('parseAdminToolJson', () => {
  it('should return null for null or undefined', () => {
    expect(parseAdminToolJson(null)).toBeNull();
    expect(parseAdminToolJson(undefined)).toBeNull();
  });

  it('should parse a JSON string', () => {
    expect(parseAdminToolJson('{"success":true}')).toEqual({ success: true });
  });

  it('should return the raw string when it is not valid JSON', () => {
    expect(parseAdminToolJson('not json')).toBe('not json');
  });

  it('should pass objects through unchanged', () => {
    expect(parseAdminToolJson({ objects: [1, 2] })).toEqual({
      objects: [1, 2],
    });
  });
});
