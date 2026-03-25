import { FieldMetadataType } from 'twenty-shared/types';

import { validateOperatorForFieldTypeOrThrow } from 'src/engine/api/common/common-args-processors/filter-arg-processor/utils/validate-operator-for-field-type-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const createFieldMetadata = (type: FieldMetadataType): FlatFieldMetadata =>
  ({
    type,
    name: 'testField',
  }) as FlatFieldMetadata;

describe('validateOperatorForFieldTypeOrThrow', () => {
  it('should not throw when operator is valid for TEXT field', () => {
    const fieldMetadata = createFieldMetadata(FieldMetadataType.TEXT);

    expect(() =>
      validateOperatorForFieldTypeOrThrow('eq', fieldMetadata, 'testField'),
    ).not.toThrow();
  });

  it('should throw when operator is invalid for TEXT field', () => {
    const fieldMetadata = createFieldMetadata(FieldMetadataType.TEXT);

    expect(() =>
      validateOperatorForFieldTypeOrThrow(
        'invalidOperator' as 'eq',
        fieldMetadata,
        'testField',
      ),
    ).toThrow(CommonQueryRunnerException);
  });

  it('should not throw when eq is valid for BOOLEAN field', () => {
    const fieldMetadata = createFieldMetadata(FieldMetadataType.BOOLEAN);

    expect(() =>
      validateOperatorForFieldTypeOrThrow('eq', fieldMetadata, 'testField'),
    ).not.toThrow();
  });

  it('should throw when like is invalid for BOOLEAN field', () => {
    const fieldMetadata = createFieldMetadata(FieldMetadataType.BOOLEAN);

    expect(() =>
      validateOperatorForFieldTypeOrThrow('like', fieldMetadata, 'testField'),
    ).toThrow(CommonQueryRunnerException);
  });
});
