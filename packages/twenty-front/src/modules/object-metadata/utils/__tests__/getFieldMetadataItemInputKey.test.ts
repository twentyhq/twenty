import { getFieldMetadataItemInputKey } from '@/object-metadata/utils/getFieldMetadataItemInputKey';

describe('getFieldMetadataItemInputKey', () => {
  it('should save both formula form fields in the formula', () => {
    expect(getFieldMetadataItemInputKey('formula')).toBe('formula');
    expect(getFieldMetadataItemInputKey('formulaCurrencyCode')).toBe('formula');
  });

  it('should keep any other form field as it is', () => {
    expect(getFieldMetadataItemInputKey('label')).toBe('label');
  });
});
