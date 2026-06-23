import type {
  MappingError,
  MappedSourceRecord,
  SupportedSourceTable,
} from '../types/mapped-source-record.type';
import type { TwentyClientLike } from '../types/twenty-client-like.type';
import { mapSupabaseRecords } from '../utils/map-supabase-record';

export const BACKFILL_SOURCE_ORDER: SupportedSourceTable[] = [
  'products',
  'profiles',
  'customer_expertise',
  'affiliates',
  'orders',
  'payments',
  'order_items',
  'commission_ledger',
  'support_tickets',
];

export type BackfillReader = (
  sourceTable: SupportedSourceTable,
) => Promise<Array<Record<string, unknown>>>;

export type BackfillDryRunInput = {
  sourceTables?: SupportedSourceTable[];
  sourceSchema?: string;
  readSourceBatch: BackfillReader;
  client: TwentyClientLike;
};

export type BackfillDryRunResult = {
  dryRun: true;
  scanned: number;
  mapped: number;
  failed: number;
  records: MappedSourceRecord[];
  errors: MappingError[];
};

const getSortTimestamp = (record: MappedSourceRecord): string => {
  const lastSyncedAt = record.fieldValues.lastSyncedAt;
  const orderedAt = record.fieldValues.orderedAt;

  return typeof lastSyncedAt === 'string'
    ? lastSyncedAt
    : typeof orderedAt === 'string'
      ? orderedAt
      : '';
};

const sortMappedRecords = (
  records: MappedSourceRecord[],
): MappedSourceRecord[] =>
  [...records].sort((left, right) => {
    const leftTimestamp = getSortTimestamp(left);
    const rightTimestamp = getSortTimestamp(right);

    if (leftTimestamp !== rightTimestamp) {
      return leftTimestamp.localeCompare(rightTimestamp);
    }

    return left.sourceRecordId.localeCompare(right.sourceRecordId);
  });

const orderSourceTables = (
  sourceTables: SupportedSourceTable[],
): SupportedSourceTable[] => {
  const requested = new Set(sourceTables);

  return BACKFILL_SOURCE_ORDER.filter((sourceTable) => requested.has(sourceTable));
};

export const runXopureBackfillDryRun = async (
  input: BackfillDryRunInput,
): Promise<BackfillDryRunResult> => {
  void input.client;

  const sourceSchema = input.sourceSchema ?? 'public';
  const sourceTables = orderSourceTables(
    input.sourceTables && input.sourceTables.length > 0
      ? input.sourceTables
      : BACKFILL_SOURCE_ORDER,
  );
  const records: MappedSourceRecord[] = [];
  const errors: MappingError[] = [];
  let scanned = 0;

  for (const sourceTable of sourceTables) {
    const sourceRows = await input.readSourceBatch(sourceTable);
    const mappedForTable: MappedSourceRecord[] = [];

    for (const sourceRow of sourceRows) {
      scanned += 1;

      const results = mapSupabaseRecords({
        eventType: 'BACKFILL',
        sourceSchema,
        sourceTable,
        record: sourceRow,
      });

      for (const result of results) {
        if (result.ok) {
          mappedForTable.push(result.record);
        } else {
          errors.push(result);
        }
      }
    }

    records.push(...sortMappedRecords(mappedForTable));
  }

  return {
    dryRun: true,
    scanned,
    mapped: records.length,
    failed: errors.length,
    records,
    errors,
  };
};
