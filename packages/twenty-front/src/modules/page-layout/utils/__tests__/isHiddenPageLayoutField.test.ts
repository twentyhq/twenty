import { isHiddenPageLayoutField } from '@/page-layout/utils/isHiddenPageLayoutField';

describe('isHiddenPageLayoutField', () => {
  it('should hide a field matched by its id', () => {
    expect(
      isHiddenPageLayoutField({
        fieldMetadataIdsOrNames: ['field-id', 'workflow'],
        hiddenFieldMetadataIdsOrNames: ['field-id'],
      }),
    ).toBe(true);
  });

  it('should hide a field matched by its name', () => {
    expect(
      isHiddenPageLayoutField({
        fieldMetadataIdsOrNames: ['field-id', 'workflow'],
        hiddenFieldMetadataIdsOrNames: ['workflow'],
      }),
    ).toBe(true);
  });

  it('should keep a field that matches nothing hidden', () => {
    expect(
      isHiddenPageLayoutField({
        fieldMetadataIdsOrNames: ['field-id', 'status'],
        hiddenFieldMetadataIdsOrNames: ['workflow'],
      }),
    ).toBe(false);
  });

  it('should keep every field when nothing is hidden', () => {
    expect(
      isHiddenPageLayoutField({
        fieldMetadataIdsOrNames: ['field-id', 'workflow'],
        hiddenFieldMetadataIdsOrNames: [],
      }),
    ).toBe(false);
  });

  it('should ignore an undefined identifier', () => {
    expect(
      isHiddenPageLayoutField({
        fieldMetadataIdsOrNames: [undefined],
        hiddenFieldMetadataIdsOrNames: ['workflow'],
      }),
    ).toBe(false);
  });
});
