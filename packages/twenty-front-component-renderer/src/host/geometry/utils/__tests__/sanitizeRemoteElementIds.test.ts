import { sanitizeRemoteElementIds } from '../sanitizeRemoteElementIds';

describe('sanitizeRemoteElementIds', () => {
  it('should return an empty array for non-array input', () => {
    expect(sanitizeRemoteElementIds('nope')).toEqual([]);
    expect(sanitizeRemoteElementIds(undefined)).toEqual([]);
    expect(sanitizeRemoteElementIds({ length: 3 })).toEqual([]);
  });

  it('should drop non-string entries', () => {
    expect(sanitizeRemoteElementIds(['1', 2, null, undefined, '3'])).toEqual([
      '1',
      '3',
    ]);
  });

  it('should drop empty string entries', () => {
    expect(sanitizeRemoteElementIds(['', 'ok', ''])).toEqual(['ok']);
  });

  it('should pass valid ids through unchanged', () => {
    expect(sanitizeRemoteElementIds(['1', '2', '3'])).toEqual(['1', '2', '3']);
  });
});
