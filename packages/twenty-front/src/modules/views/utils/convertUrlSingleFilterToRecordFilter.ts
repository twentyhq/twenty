import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type UrlSingleFilter } from '@/views/types/UrlSingleFilter';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isExpectedSubFieldName } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

export const convertUrlSingleFilterToRecordFilter = ({
  urlSingleFilter,
  objectMetadataItem,
  recordFilterGroupId,
  positionInGroup,
}: {
  urlSingleFilter: UrlSingleFilter;
  objectMetadataItem: ObjectMetadataItem;
  recordFilterGroupId?: string;
  positionInGroup: number;
}): RecordFilter | null => {
  const fieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.name === urlSingleFilter.field,
  );

  if (!isDefined(fieldMetadataItem)) {
    return null;
  }

  if (isNonEmptyString(urlSingleFilter.subField)) {
    if (!isCompositeFieldType(fieldMetadataItem.type)) {
      return null;
    }

    if (
      !isExpectedSubFieldName(
        fieldMetadataItem.type as Parameters<typeof isExpectedSubFieldName>[0],
        urlSingleFilter.subField as Parameters<
          typeof isExpectedSubFieldName
        >[1],
        urlSingleFilter.subField,
      )
    ) {
      return null;
    }
  }

  const displayValue = urlSingleFilter.value;

  const recordFilter: RecordFilter = {
    id: uuidv4(),
    fieldMetadataId: fieldMetadataItem.id,
    value: urlSingleFilter.value,
    displayValue,
    type: fieldMetadataItem.type as RecordFilter['type'],
    operand: urlSingleFilter.op,
    label: fieldMetadataItem.label,
    positionInRecordFilterGroup: positionInGroup,
  };

  if (isDefined(recordFilterGroupId)) {
    recordFilter.recordFilterGroupId = recordFilterGroupId;
  }

  if (isNonEmptyString(urlSingleFilter.subField)) {
    recordFilter.subFieldName =
      urlSingleFilter.subField as RecordFilter['subFieldName'];
  }

  return recordFilter;
};
