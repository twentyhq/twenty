// ClickHouse returns DateTime64 values in the format 'YYYY-MM-DD HH:mm:ss.SSSSSS'
// (space-separated, up to 6 fractional digits). Twenty's DATE_TIME fields expect
// ISO 8601 format ('YYYY-MM-DDTHH:mm:ss.SSSZ', at most 3 fractional digits).
//
// Additionally, ClickHouse uses '1970-01-01 00:00:00.000000' as a sentinel for
// null/empty dates. We map that to null.

const CLICKHOUSE_EPOCH_SENTINEL = '1970-01-01 00:00:00.000000';

export const clickHouseDateToIso = (value: string): string | null => {
  if (!value || value === CLICKHOUSE_EPOCH_SENTINEL) {
    return null;
  }

  return new Date(value.replace(' ', 'T') + 'Z').toISOString();
};
