import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';

describe('isLabelIdentifierField', () => {
  it('should not find unknown labelIdentifier', () => {
    const res = isLabelIdentifierField({
      fieldMetadataItem: { id: 'fieldId', name: 'fieldName' },
      objectMetadataItem: {
        labelIdentifierFieldMetadataId: 'unknown',
      },
    });
    expect(res).toBe(false);
  });

  it('should find known labelIdentifier', () => {
    const res = isLabelIdentifierField({
      fieldMetadataItem: { id: 'fieldId', name: 'fieldName' },
      objectMetadataItem: {
        labelIdentifierFieldMetadataId: 'fieldId',
      },
    });
    expect(res).toBe(true);
  });
});
