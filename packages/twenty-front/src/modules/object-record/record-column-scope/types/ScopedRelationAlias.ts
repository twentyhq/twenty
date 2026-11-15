import { type RecordGqlRelationAlias } from '@/object-record/graphql/types/RecordGqlRelationAlias';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export type ScopedRelationAlias = RecordGqlRelationAlias & {
  ownerViewFieldId: string;
  prefillRecordFilters: RecordFilter[];
};
