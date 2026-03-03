import { FieldMetadataType } from 'twenty-shared/types';

import { validateAndTransformValueByFieldType } from 'src/engine/api/common/common-args-processors/filter-arg-processor/utils/validate-and-transform-value-by-field-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const createFieldMetadata = (type: FieldMetadataType): FlatFieldMetadata =>
  ({
    type,
    name: 'testField',
  }) as FlatFieldMetadata;

describe('validateAndTransformValueByFieldType', () => {
  it('should validate and return number for NUMBER field', () => {
    const fieldMetadata = createFieldMetadata(FieldMetadataType.NUMBER);
    const result = validateAndTransformValueByFieldType(
      42,
      fieldMetadata,
      'testField',
    );

    expect(result).toBe(42);
  });

  it('should validate and return boolean for BOOLEAN field', () => {
    const fieldMetadata = createFieldMetadata(FieldMetadataType.BOOLEAN);
    const result = validateAndTransformValueByFieldType(
      true,
      fieldMetadata,
      'testField',
    );

    expect(result).toBe(true);
  });

  it('should return value unchanged for TEXT field', () => {
    const fieldMetadata = createFieldMetadata(FieldMetadataType.TEXT);
    const result = validateAndTransformValueByFieldType(
      'hello',
      fieldMetadata,
      'testField',
    );

    expect(result).toBe('hello');
  });
});
