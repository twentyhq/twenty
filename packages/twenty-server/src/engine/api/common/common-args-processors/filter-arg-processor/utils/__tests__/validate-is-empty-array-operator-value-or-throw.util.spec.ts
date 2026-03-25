import { validateIsEmptyArrayOperatorValueOrThrow } from 'src/engine/api/common/common-args-processors/filter-arg-processor/utils/validate-is-empty-array-operator-value-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateIsEmptyArrayOperatorValueOrThrow', () => {
  it('should not throw when value is true', () => {
    expect(() =>
      validateIsEmptyArrayOperatorValueOrThrow(true, 'fieldName'),
    ).not.toThrow();
  });

  it('should not throw when value is false', () => {
    expect(() =>
      validateIsEmptyArrayOperatorValueOrThrow(false, 'fieldName'),
    ).not.toThrow();
  });

  it('should throw when value is not a boolean', () => {
    expect(() =>
      validateIsEmptyArrayOperatorValueOrThrow('true', 'fieldName'),
    ).toThrow(CommonQueryRunnerException);
  });

  it('should throw when value is an array', () => {
    expect(() =>
      validateIsEmptyArrayOperatorValueOrThrow([], 'fieldName'),
    ).toThrow(CommonQueryRunnerException);
  });
});
