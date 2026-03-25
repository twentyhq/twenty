import { validateIsOperatorFilterValueOrThrow } from 'src/engine/api/common/common-args-processors/filter-arg-processor/utils/validate-is-operator-filter-value-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateIsOperatorFilterValueOrThrow', () => {
  it('should not throw when value is NULL', () => {
    expect(() => validateIsOperatorFilterValueOrThrow('NULL')).not.toThrow();
  });

  it('should not throw when value is NOT_NULL', () => {
    expect(() =>
      validateIsOperatorFilterValueOrThrow('NOT_NULL'),
    ).not.toThrow();
  });

  it('should throw when value is invalid', () => {
    expect(() => validateIsOperatorFilterValueOrThrow('invalid')).toThrow(
      CommonQueryRunnerException,
    );
  });

  it('should throw when value is null', () => {
    expect(() => validateIsOperatorFilterValueOrThrow(null)).toThrow(
      CommonQueryRunnerException,
    );
  });

  it('should throw when value is empty string', () => {
    expect(() => validateIsOperatorFilterValueOrThrow('')).toThrow(
      CommonQueryRunnerException,
    );
  });
});
