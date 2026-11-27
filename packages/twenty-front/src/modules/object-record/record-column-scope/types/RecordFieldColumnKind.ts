import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/RecordFieldLookupTarget';
import { type RecordFieldSummary } from '@/object-record/record-column-summary/types/RecordFieldSummary';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';

export type RecordFieldColumnKind =
  | { kind: 'field' }
  | { kind: 'lookup'; lookupTarget: RecordFieldLookupTarget }
  | { kind: 'scopedRecords'; scopedRelationAlias: ScopedRelationAlias }
  | {
      kind: 'scopedLookup';
      scopedRelationAlias: ScopedRelationAlias;
      lookupTarget: RecordFieldLookupTarget;
    }
  | {
      kind: 'summary';
      scopedRelationAlias: ScopedRelationAlias;
      // Missing when the user cannot read the summarized field
      summary?: RecordFieldSummary;
    };
