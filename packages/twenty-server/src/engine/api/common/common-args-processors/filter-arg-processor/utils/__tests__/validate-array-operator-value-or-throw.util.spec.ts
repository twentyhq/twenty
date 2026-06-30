import { validateArrayOperatorValueOrThrow } from 'src/engine/api/common/common-args-processors/filter-arg-processor/utils/validate-array-operator-value-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateArrayOperatorValueOrThrow', () => {
  it('should not throw when value is an array', () => {
    expect(() =>
      validateArrayOperatorValueOrThrow([1, 2], 'in', 'fieldName'),
    ).not.toThrow();
  });

  it('should throw when value is not an array', () => {
    expect(() =>
      validateArrayOperatorValueOrThrow('not-array', 'in', 'fieldName'),
    ).toThrow(CommonQueryRunnerException);
  });

  it('should throw when value is object', () => {
    expect(() =>
      validateArrayOperatorValueOrThrow({}, 'containsAny', 'fieldName'),
    ).toThrow(CommonQueryRunnerException);
  });
});
