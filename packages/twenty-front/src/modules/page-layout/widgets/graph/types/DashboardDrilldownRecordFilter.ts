import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';

export type DashboardDrilldownRecordFilter = Pick<
  PersistedRecordFilter,
  'fieldMetadataId' | 'operand' | 'value'
>;
