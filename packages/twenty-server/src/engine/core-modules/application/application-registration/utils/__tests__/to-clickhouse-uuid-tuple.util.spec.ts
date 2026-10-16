import { ClickHouseExceptionCode } from 'src/database/clickhouse/clickhouse.exception';
import { toClickHouseUuidTuple } from 'src/engine/core-modules/application/application-registration/utils/to-clickhouse-uuid-tuple.util';

describe('toClickHouseUuidTuple', () => {
  it('formats UUIDs as SQL literals in a tuple', () => {
    expect(
      toClickHouseUuidTuple([
        '01234567-89ab-cdef-0123-456789abcdef',
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      ]),
    ).toBe(
      "('01234567-89ab-cdef-0123-456789abcdef', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')",
    );
  });

  it('rejects identifiers that could alter the SQL query', () => {
    expect(() =>
      toClickHouseUuidTuple(["01234567-89ab-cdef-0123-456789abcdef' OR 1=1"]),
    ).toThrow(
      expect.objectContaining({
        code: ClickHouseExceptionCode.INVALID_QUERY_IDENTIFIER,
      }),
    );
  });
});
