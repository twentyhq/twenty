import { splitFieldNameIntoBaseAndSubField } from '@/views/utils/splitFieldNameIntoBaseAndSubField';

describe('splitFieldNameIntoBaseAndSubField', () => {
  it('should return the base field name when there is no sub-field', () => {
    expect(splitFieldNameIntoBaseAndSubField('name')).toEqual({
      baseFieldName: 'name',
      subFieldName: undefined,
    });
  });

  it('should split a dotted field name into base and sub-field', () => {
    expect(splitFieldNameIntoBaseAndSubField('address.city')).toEqual({
      baseFieldName: 'address',
      subFieldName: 'city',
    });
  });

  it('should preserve nested sub-fields joined with dots', () => {
    expect(splitFieldNameIntoBaseAndSubField('address.street.number')).toEqual({
      baseFieldName: 'address',
      subFieldName: 'street.number',
    });
  });
});
