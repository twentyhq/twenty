import { resolveAddressSortSubField } from '@/object-metadata/utils/resolveAddressSortSubField';

describe('resolveAddressSortSubField', () => {
  it('returns the requested sub-field when it is enabled', () => {
    expect(
      resolveAddressSortSubField(
        { subFields: ['addressStreet1', 'addressState'] },
        'addressState',
      ),
    ).toBe('addressState');
  });

  it('falls back to addressCity when the requested sub-field is disabled', () => {
    expect(
      resolveAddressSortSubField(
        { subFields: ['addressStreet1', 'addressCity'] },
        'addressState',
      ),
    ).toBe('addressCity');
  });

  it('falls back to addressCity when the requested sub-field is not a recognized address sub-field', () => {
    expect(resolveAddressSortSubField({}, 'notARealSubField')).toBe(
      'addressCity',
    );
  });

  it('falls back to addressCity when no request is given', () => {
    expect(resolveAddressSortSubField(null)).toBe('addressCity');
    expect(resolveAddressSortSubField(undefined)).toBe('addressCity');
    expect(resolveAddressSortSubField({})).toBe('addressCity');
  });

  it('falls back to the first enabled sub-field when addressCity is disabled', () => {
    expect(
      resolveAddressSortSubField({
        subFields: ['addressStreet1', 'addressState'],
      }),
    ).toBe('addressStreet1');
  });

  it('falls back to first enabled sub-field even when the requested is recognized but disabled and addressCity is also disabled', () => {
    expect(
      resolveAddressSortSubField(
        { subFields: ['addressStreet1', 'addressCountry'] },
        'addressState',
      ),
    ).toBe('addressStreet1');
  });
});
