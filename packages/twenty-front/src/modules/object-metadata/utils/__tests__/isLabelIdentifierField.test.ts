import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';

describe('isLabelIdentifierField', () => {
  it('should work as expected', () => {
    const res = isLabelIdentifierField({
      fieldMetadataItem: { id: 'fieldId', name: 'fieldName' },
      objectMetadataItem: {},
    });
    expect(res).toBe(false);
  });
});
