import { FieldMetadataType } from 'twenty-shared/types';

import { validateAndTransformOperatorAndValue } from 'src/engine/api/common/common-args-processors/filter-arg-processor/utils/validate-and-transform-operator-and-value.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const createFieldMetadata = (type: FieldMetadataType): FlatFieldMetadata =>
  ({
    type,
    name: 'testField',
  }) as FlatFieldMetadata;

describe('validateAndTransformOperatorAndValue', () => {
  it('should validate and transform single operator filter', () => {
    const fieldMetadata = createFieldMetadata(FieldMetadataType.TEXT);
    const result = validateAndTransformOperatorAndValue(
      'testField',
      { eq: 'hello' },
      fieldMetadata,
    );

    expect(result).toEqual({ eq: 'hello' });
  });

  it('should throw when filter value is null', () => {
    const fieldMetadata = createFieldMetadata(FieldMetadataType.TEXT);

    expect(() =>
      validateAndTransformOperatorAndValue(
        'testField',
        null as unknown as Record<string, unknown>,
        fieldMetadata,
      ),
    ).toThrow(CommonQueryRunnerException);
  });

  it('should throw when filter has no operators', () => {
    const fieldMetadata = createFieldMetadata(FieldMetadataType.TEXT);

    expect(() =>
      validateAndTransformOperatorAndValue('testField', {}, fieldMetadata),
    ).toThrow(CommonQueryRunnerException);
  });
});
