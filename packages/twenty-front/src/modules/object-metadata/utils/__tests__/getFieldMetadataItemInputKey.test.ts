import { getFieldMetadataItemInputKey } from '@/object-metadata/utils/getFieldMetadataItemInputKey';

describe('getFieldMetadataItemInputKey', () => {
  it('should save the formula form fields in the settings', () => {
    expect(getFieldMetadataItemInputKey('formula')).toBe('settings');
    expect(getFieldMetadataItemInputKey('formulaCurrencyCode')).toBe(
      'settings',
    );
  });

  it('should keep any other form field as it is', () => {
    expect(getFieldMetadataItemInputKey('label')).toBe('label');
  });
});
