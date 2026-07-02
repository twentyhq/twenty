import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { type RecordChipData } from '@/object-record/record-field/ui/types/RecordChipData';
import { getRecordGroupByValueLabelFromFieldValue } from '@/object-record/record-show/utils/getRecordGroupByValueLabelFromFieldValue';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getRecordGroupByValueLabel = ({
  groupByFieldMetadataItem,
  rawGroupFieldValue,
  relationRecordId,
  relationRecord,
  isLoadingRelationRecord,
  identifierChipGenerator,
}: {
  groupByFieldMetadataItem?: FieldMetadataItem;
  rawGroupFieldValue: unknown;
  relationRecordId?: string;
  relationRecord?: ObjectRecord;
  isLoadingRelationRecord: boolean;
  identifierChipGenerator?: (record: ObjectRecord) => RecordChipData;
}): string | undefined => {
  if (!isDefined(groupByFieldMetadataItem)) return undefined;

  if (
    isManyToOneRelationField(groupByFieldMetadataItem) &&
    isDefined(relationRecordId)
  ) {
    if (isLoadingRelationRecord) return undefined;
    if (!isDefined(relationRecord)) return t`Deleted`;
    if (!isDefined(identifierChipGenerator)) return undefined;

    return identifierChipGenerator(relationRecord).name;
  }

  return getRecordGroupByValueLabelFromFieldValue({
    groupByFieldMetadataItem,
    fieldValue: rawGroupFieldValue,
  });
};
