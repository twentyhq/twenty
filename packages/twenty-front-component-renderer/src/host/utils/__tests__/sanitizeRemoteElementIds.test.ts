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

  it('should drop empty and over-long ids', () => {
    expect(sanitizeRemoteElementIds(['', 'x'.repeat(65), 'ok'])).toEqual([
      'ok',
    ]);
  });

  it('should cap the array length', () => {
    const remoteElementIds = Array.from({ length: 1000 }, (_, index) =>
      String(index),
    );

    expect(sanitizeRemoteElementIds(remoteElementIds)).toHaveLength(500);
    expect(sanitizeRemoteElementIds(remoteElementIds, 10)).toHaveLength(10);
  });
});
