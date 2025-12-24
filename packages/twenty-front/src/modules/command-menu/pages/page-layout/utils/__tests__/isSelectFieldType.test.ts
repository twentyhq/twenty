import { FieldMetadataType } from 'twenty-shared/types';

import { isSelectFieldType } from '@/command-menu/pages/page-layout/utils/isSelectFieldType';

describe('isSelectFieldType', () => {
  it('should return true for SELECT field type', () => {
    expect(isSelectFieldType(FieldMetadataType.SELECT)).toBe(true);
  });

  it('should return true for MULTI_SELECT field type', () => {
    expect(isSelectFieldType(FieldMetadataType.MULTI_SELECT)).toBe(true);
  });

  it('should return false for TEXT field type', () => {
    expect(isSelectFieldType(FieldMetadataType.TEXT)).toBe(false);
  });

  it('should return false for NUMBER field type', () => {
    expect(isSelectFieldType(FieldMetadataType.NUMBER)).toBe(false);
  });

  it('should return false for DATE field type', () => {
    expect(isSelectFieldType(FieldMetadataType.DATE)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isSelectFieldType(undefined)).toBe(false);
  });
});
