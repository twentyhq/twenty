import { FieldMetadataType } from 'twenty-shared/types';

import { validateSelectFieldOrThrow } from 'src/engine/api/common/common-args-processors/filter-arg-processor/validator-utils/validate-select-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const createSelectFieldMetadata = (
  options: { value: string }[],
): FlatFieldMetadata =>
  ({
    type: FieldMetadataType.SELECT,
    name: 'stage',
    options,
  }) as unknown as FlatFieldMetadata;

describe('validateSelectFieldOrThrow', () => {
  it('should accept a valid option value', () => {
    const fieldMetadata = createSelectFieldMetadata([
      { value: 'OPEN' },
      { value: 'CLOSED' },
    ]);

    expect(validateSelectFieldOrThrow('OPEN', fieldMetadata, 'stage')).toBe(
      'OPEN',
    );
  });

  it('should throw for a value not in the options', () => {
    const fieldMetadata = createSelectFieldMetadata([
      { value: 'OPEN' },
      { value: 'CLOSED' },
    ]);

    expect(() =>
      validateSelectFieldOrThrow(
        'WON_SUBSCRIPTION',
        fieldMetadata,
        'stage',
      ),
    ).toThrow(CommonQueryRunnerException);
  });

  it('should throw for a non-string value', () => {
    const fieldMetadata = createSelectFieldMetadata([{ value: 'OPEN' }]);

    expect(() =>
      validateSelectFieldOrThrow(123, fieldMetadata, 'stage'),
    ).toThrow(CommonQueryRunnerException);
  });

  it('should accept any string value when field has no options', () => {
    const fieldMetadata = createSelectFieldMetadata([]);

    expect(
      validateSelectFieldOrThrow('ANYTHING', fieldMetadata, 'stage'),
    ).toBe('ANYTHING');
  });
});
