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

  it('should throw when filter has no operators', () => {
    const fieldMetadata = createFieldMetadata(FieldMetadataType.TEXT);

    expect(() =>
      validateAndTransformOperatorAndValue('testField', {}, fieldMetadata),
    ).toThrow(CommonQueryRunnerException);
  });

  it('should throw when filter has multiple operators', () => {
    const fieldMetadata = createFieldMetadata(FieldMetadataType.TEXT);

    expect(() =>
      validateAndTransformOperatorAndValue(
        'testField',
        { eq: 'a', neq: 'b' },
        fieldMetadata,
      ),
    ).toThrow(CommonQueryRunnerException);
  });

  it('should coerce and transform number for NUMBER field', () => {
    const fieldMetadata = createFieldMetadata(FieldMetadataType.NUMBER);
    const result = validateAndTransformOperatorAndValue(
      'testField',
      { eq: '42' },
      fieldMetadata,
    );

    expect(result).toEqual({ eq: 42 });
  });
});
