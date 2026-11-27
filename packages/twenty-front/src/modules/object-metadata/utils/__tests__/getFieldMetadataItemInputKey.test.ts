import { getFieldMetadataItemInputKey } from '@/object-metadata/utils/getFieldMetadataItemInputKey';

describe('getFieldMetadataItemInputKey', () => {
  it('should save every formula form field in the formula', () => {
    expect(getFieldMetadataItemInputKey('formula')).toBe('formula');
    expect(getFieldMetadataItemInputKey('formulaCurrencyCode')).toBe('formula');
    expect(getFieldMetadataItemInputKey('formulaEvaluation')).toBe('formula');
  });

  it('should keep any other form field as it is', () => {
    expect(getFieldMetadataItemInputKey('label')).toBe('label');
  });
});
