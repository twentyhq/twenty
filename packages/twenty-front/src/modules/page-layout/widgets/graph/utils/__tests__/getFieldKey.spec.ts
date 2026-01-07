import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { getFieldKey } from '@/page-layout/widgets/graph/utils/getFieldKey';

describe('getFieldKey', () => {
  it('should return field name for non-composite field', () => {
    const field = {
      name: 'companyName',
      type: FieldMetadataType.TEXT,
    } as FieldMetadataItem;

    expect(getFieldKey({ field })).toBe('companyName');
  });

  it('should return composite key for composite field with subFieldName', () => {
    const field = {
      name: 'address',
      type: FieldMetadataType.ADDRESS,
    } as FieldMetadataItem;

    expect(getFieldKey({ field, subFieldName: 'city' })).toBe('address.city');
  });

  it('should return field name when subFieldName is null', () => {
    const field = {
      name: 'address',
      type: FieldMetadataType.ADDRESS,
    } as FieldMetadataItem;

    expect(getFieldKey({ field, subFieldName: null })).toBe('address');
  });
});
