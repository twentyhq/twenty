import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';

describe('getObjectColorWithFallback', () => {
  it('should return gray when no object metadata item is provided', () => {
    expect(getObjectColorWithFallback(undefined)).toBe('gray');
  });

  it('should return gray for system objects', () => {
    expect(
      getObjectColorWithFallback({
        nameSingular: 'rocket',
        color: 'purple',
        isSystem: true,
      }),
    ).toBe('gray');
  });

  it('should return the stored color when there is one', () => {
    expect(
      getObjectColorWithFallback({
        nameSingular: 'rocket',
        color: 'purple',
        isSystem: false,
      }),
    ).toBe('purple');
  });

  it('should fall back to the standard object color', () => {
    expect(
      getObjectColorWithFallback({
        nameSingular: 'company',
        color: null,
        isSystem: false,
      }),
    ).toBe('blue');
  });

  it('should derive a stable color from the name of a custom object', () => {
    const color = getObjectColorWithFallback({
      nameSingular: 'rocket',
      color: null,
      isSystem: false,
    });

    expect(color).not.toBe('gray');
    expect(
      getObjectColorWithFallback({
        nameSingular: 'rocket',
        color: null,
        isSystem: false,
      }),
    ).toBe(color);
  });

  it('should return gray when the object has neither a color nor a name yet', () => {
    expect(
      getObjectColorWithFallback({
        nameSingular: undefined,
        color: undefined,
        isSystem: false,
      }),
    ).toBe('gray');
  });
});
