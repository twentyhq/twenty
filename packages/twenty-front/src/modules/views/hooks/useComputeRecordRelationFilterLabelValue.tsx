import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRelationObjectMetadataNameSingular } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';
import { MAX_RECORDS_TO_DISPLAY } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordSelect';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { useGetRecordFilterChipLabelValue } from '@/views/hooks/useGetRecordFilterChipLabelValue';

import { t } from '@lingui/core/macro';
import {
  arrayOfUuidOrVariableSchema,
  isDefined,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/utils';

type ObjectFilterDropdownRecordSelectProps = {
  recordFilter: RecordFilter;
};

// TODO: refactor this with new useGetRecordFilterDisplayValue
export const useComputeRecordRelationFilterLabelValue = ({
  recordFilter,
}: ObjectFilterDropdownRecordSelectProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const { getRecordFilterChipLabelValue } = useGetRecordFilterChipLabelValue();

  if (!isDefined(recordFilter.fieldMetadataId)) {
    throw new Error('fieldMetadataItemUsedInFilterDropdown is not defined');
  }

  const { fieldMetadataItem } = getFieldMetadataItemByIdOrThrow({
    fieldMetadataId: recordFilter.fieldMetadataId,
    objectMetadataItems,
  });

  const relationObjectMetadataNameSingular =
    getRelationObjectMetadataNameSingular({
      field: fieldMetadataItem,
    });

  if (!isDefined(relationObjectMetadataNameSingular)) {
    throw new Error('relationObjectMetadataNameSingular is not defined');
  }

  const relationObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === relationObjectMetadataNameSingular,
  );

  if (!isDefined(relationObjectMetadataItem)) {
    throw new Error('relationObjectMetadataItem is not defined');
  }

  const relationObjectLabelPlural = relationObjectMetadataItem.labelPlural;

  const { isCurrentWorkspaceMemberSelected, selectedRecordIds } =
    jsonRelationFilterValueSchema
      .catch({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: arrayOfUuidOrVariableSchema.parse(
          recordFilter.value,
        ),
      })
      .parse(recordFilter.value);

  const { selectedRecords, loading } = useRecordsForSelect({
    searchFilterText: '',
    selectedIds: selectedRecordIds,
    objectNameSingular: relationObjectMetadataNameSingular,
    limit: 10,
  });

  if (loading) {
    return { labelValue: t`: Loading...` };
  }

  const labelValueItems = [
    ...(isCurrentWorkspaceMemberSelected ? [t`Me`] : []),
    ...selectedRecords.map((record) => record.name),
  ];

  const filterDisplayValue =
    labelValueItems.length > MAX_RECORDS_TO_DISPLAY
      ? `${labelValueItems.length} ${relationObjectLabelPlural.toLowerCase()}`
      : labelValueItems.join(', ');

  return {
    labelValue:
      labelValueItems.length > 0
        ? getRecordFilterChipLabelValue({
            recordFilter: {
              ...recordFilter,
              displayValue: filterDisplayValue,
            },
          })
        : getRecordFilterChipLabelValue({
            recordFilter,
          }),
  };
};
