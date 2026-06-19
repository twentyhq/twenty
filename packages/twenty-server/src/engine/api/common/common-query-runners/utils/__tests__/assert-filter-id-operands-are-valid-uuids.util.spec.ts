import { assertFilterIdOperandsAreValidUuids } from 'src/engine/api/common/common-query-runners/utils/assert-filter-id-operands-are-valid-uuids.util';
import { WorkspaceQueryRunnerException } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';

const VALID_UUID = '20202020-0000-4000-8000-000000000000';
const INVALID_UUID = 'not-a-uuid';

describe('assertFilterIdOperandsAreValidUuids', () => {
  it('should not throw when the filter is undefined', () => {
    expect(() => assertFilterIdOperandsAreValidUuids(undefined)).not.toThrow();
  });

  it('should not throw when there is no id filter', () => {
    expect(() =>
      assertFilterIdOperandsAreValidUuids({ name: { eq: 'John' } }),
    ).not.toThrow();
  });

  it.each(['eq', 'neq', 'gt', 'gte', 'lt', 'lte'])(
    'should not throw when id.%s is a valid UUID',
    (operand) => {
      expect(() =>
        assertFilterIdOperandsAreValidUuids({ id: { [operand]: VALID_UUID } }),
      ).not.toThrow();
    },
  );

  it.each(['eq', 'neq', 'gt', 'gte', 'lt', 'lte'])(
    'should throw when id.%s is not a valid UUID',
    (operand) => {
      expect(() =>
        assertFilterIdOperandsAreValidUuids({
          id: { [operand]: INVALID_UUID },
        }),
      ).toThrow(WorkspaceQueryRunnerException);
    },
  );

  it('should not throw when all id.in entries are valid UUIDs', () => {
    expect(() =>
      assertFilterIdOperandsAreValidUuids({
        id: { in: [VALID_UUID, VALID_UUID] },
      }),
    ).not.toThrow();
  });

  it('should throw when any id.in entry is not a valid UUID', () => {
    expect(() =>
      assertFilterIdOperandsAreValidUuids({
        id: { in: [VALID_UUID, INVALID_UUID] },
      }),
    ).toThrow(WorkspaceQueryRunnerException);
  });

  it('should ignore the null-check `is` operand which is not a UUID', () => {
    expect(() =>
      assertFilterIdOperandsAreValidUuids({ id: { is: 'NOT_NULL' } }),
    ).not.toThrow();
  });
});
