import { resolveAddressSortSubField } from '@/object-metadata/utils/resolveAddressSortSubField';

describe('resolveAddressSortSubField', () => {
  it('returns the requested sub-field when it is enabled', () => {
    expect(
      resolveAddressSortSubField({
        settings: { subFields: ['addressStreet1', 'addressState'] },
        primaryCompositeSubField: 'addressState',
      }),
    ).toBe('addressState');
  });

  it('falls back to addressCity when the requested sub-field is disabled', () => {
    expect(
      resolveAddressSortSubField({
        settings: { subFields: ['addressStreet1', 'addressCity'] },
        primaryCompositeSubField: 'addressState',
      }),
    ).toBe('addressCity');
  });

  it('falls back to addressCity when the requested sub-field is not a recognized address sub-field', () => {
    expect(
      resolveAddressSortSubField({
        settings: {},
        primaryCompositeSubField: 'notARealSubField',
      }),
    ).toBe('addressCity');
  });

  it('falls back to addressCity when no request is given', () => {
    expect(resolveAddressSortSubField({ settings: null })).toBe('addressCity');
    expect(resolveAddressSortSubField({ settings: undefined })).toBe(
      'addressCity',
    );
    expect(resolveAddressSortSubField({ settings: {} })).toBe('addressCity');
  });

  it('falls back to the first enabled sub-field when addressCity is disabled', () => {
    expect(
      resolveAddressSortSubField({
        settings: { subFields: ['addressStreet1', 'addressState'] },
      }),
    ).toBe('addressStreet1');
  });

  it('falls back to first enabled sub-field even when the requested is recognized but disabled and addressCity is also disabled', () => {
    expect(
      resolveAddressSortSubField({
        settings: { subFields: ['addressStreet1', 'addressCountry'] },
        primaryCompositeSubField: 'addressState',
      }),
    ).toBe('addressStreet1');
  });
});
