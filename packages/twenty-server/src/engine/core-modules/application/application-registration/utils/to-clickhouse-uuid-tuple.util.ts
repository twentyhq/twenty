import {
  ClickHouseException,
  ClickHouseExceptionCode,
} from 'src/database/clickhouse/clickhouse.exception';

export const toClickHouseUuidTuple = (ids: string[]): string => {
  if (
    ids.some(
      (id) =>
        !/^[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(id),
    )
  ) {
    throw new ClickHouseException(
      'Expected UUID installation identifiers',
      ClickHouseExceptionCode.INVALID_QUERY_IDENTIFIER,
    );
  }

  return `(${ids.map((id) => `'${id}'`).join(', ')})`;
};
