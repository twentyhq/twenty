import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRelationObjectMetadataNameSingular } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { getRecordFilterLabelValue } from '@/views/utils/getRecordFilterLabelValue';
import { type RelationFilterValue } from '@/views/view-filter-value/types/RelationFilterValue';
import { arrayOfUuidOrVariableSchema } from '@/views/view-filter-value/validation-schemas/arrayOfUuidsOrVariablesSchema';
import { jsonRelationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/jsonRelationFilterValueSchema';
import { isDefined } from 'twenty-shared/utils';
import { IconUserCircle } from 'twenty-ui/display';

export const EMPTY_FILTER_VALUE: string = JSON.stringify({
  isCurrentWorkspaceMemberSelected: false,
  selectedRecordIds: [],
} satisfies RelationFilterValue);

export const MAX_RECORDS_TO_DISPLAY = 3;

type ObjectFilterDropdownRecordSelectProps = {
  recordFilter: RecordFilter;
};

export const useComputeRecordFilterLabelValue = ({
  recordFilter,
}: ObjectFilterDropdownRecordSelectProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

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

  const relationObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === relationObjectMetadataNameSingular,
  );

  const { isCurrentWorkspaceMemberSelected } = jsonRelationFilterValueSchema
    .catch({
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: arrayOfUuidOrVariableSchema.parse(recordFilter.value),
    })
    .parse(recordFilter.value);

  const { selectedRecordIds } = jsonRelationFilterValueSchema
    .catch({
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: arrayOfUuidOrVariableSchema.parse(recordFilter?.value),
    })
    .parse(recordFilter?.value);

  const { loading, filteredSelectedRecords, recordsToSelect, selectedRecords } =
    useRecordsForSelect({
      searchFilterText: '',
      selectedIds: selectedRecordIds,
      objectNameSingular: relationObjectMetadataNameSingular ?? '',
      limit: 10,
    });

  const currentWorkspaceMemberSelectableItem: SelectableItem = {
    id: CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID,
    name: 'Me',
    isSelected: isCurrentWorkspaceMemberSelected ?? false,
    AvatarIcon: IconUserCircle,
  };

  return { labelValue: getRecordFilterLabelValue(recordFilter) };
};
