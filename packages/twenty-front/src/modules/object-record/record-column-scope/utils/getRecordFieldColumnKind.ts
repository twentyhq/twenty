import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { type RecordFieldColumnKind } from '@/object-record/record-column-scope/types/RecordFieldColumnKind';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isDefined } from 'twenty-shared/utils';

export const getRecordFieldColumnKind = ({
  recordField,
  fieldMetadataItem,
  scopedRelationAlias,
  objectMetadataItems,
  isLookupColumnsEnabled,
}: {
  recordField: Pick<
    RecordField,
    'relationScope' | 'relationTargetFieldMetadataId'
  >;
  fieldMetadataItem: FieldMetadataItem | undefined;
  scopedRelationAlias: ScopedRelationAlias | undefined;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  isLookupColumnsEnabled: boolean;
}): RecordFieldColumnKind => {
  if (isDefined(scopedRelationAlias)) {
    // The alias of a summary whose field is unreadable carries no summary, so the scope tells it apart
    if (isDefined(recordField.relationScope?.aggregateOperation)) {
      return {
        kind: 'summary',
        scopedRelationAlias,
        summary: scopedRelationAlias.summary,
      };
    }

    return isDefined(scopedRelationAlias.lookupTarget)
      ? {
          kind: 'scopedLookup',
          scopedRelationAlias,
          lookupTarget: scopedRelationAlias.lookupTarget,
        }
      : { kind: 'scopedRecords', scopedRelationAlias };
  }

  const lookupTarget = isDefined(fieldMetadataItem)
    ? getRecordFieldLookupTarget({
        recordField,
        fieldMetadataItem,
        objectMetadataItems,
        isLookupColumnsEnabled,
      })
    : undefined;

  return isDefined(lookupTarget)
    ? { kind: 'lookup', lookupTarget }
    : { kind: 'field' };
};
