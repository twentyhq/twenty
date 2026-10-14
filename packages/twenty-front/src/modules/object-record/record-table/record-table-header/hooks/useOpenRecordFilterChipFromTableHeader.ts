import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { resolveRecordFieldRelationTraversal } from '@/object-record/record-field/utils/relation-traversal/resolveRecordFieldRelationTraversal';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { getEditableChipDropdownId } from '@/views/editable-chip/utils/getEditableChipDropdownId';
import { useSetEditableFilterChipDropdownStates } from '@/views/hooks/useSetEditableFilterChipDropdownStates';
import { isDefined } from 'twenty-shared/utils';

export const useOpenRecordFilterChipFromTableHeader = () => {
  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { openDropdown } = useOpenDropdown();

  const { setEditableFilterChipDropdownStates } =
    useSetEditableFilterChipDropdownStates();

  const openRecordFilterChipFromTableHeader = (
    recordField: Pick<
      RecordField,
      'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
    >,
  ) => {
    const fieldMetadataItemId = recordField.fieldMetadataItemId;

    const correspondingFieldMetadataItem = filterableFieldMetadataItems.find(
      (fieldMetadataItemToFind) =>
        fieldMetadataItemToFind.id === fieldMetadataItemId,
    );

    if (!isDefined(correspondingFieldMetadataItem)) {
      throw new Error(
        `Cannot find field metadata item with id : ${fieldMetadataItemId}`,
      );
    }

    const relationTraversal = resolveRecordFieldRelationTraversal({
      recordField,
      sourceObjectMetadataItem: objectMetadataItem,
      objectMetadataItems,
    });

    const relationTargetFieldMetadataId =
      relationTraversal?.targetFieldMetadataItem.id ?? null;

    const existingNonAdvancedRecordFilter = currentRecordFilters.find(
      (recordFilter) =>
        recordFilter.fieldMetadataId === fieldMetadataItemId &&
        (recordFilter.relationTargetFieldMetadataId ?? null) ===
          relationTargetFieldMetadataId &&
        !isDefined(recordFilter.recordFilterGroupId),
    );

    if (isDefined(existingNonAdvancedRecordFilter)) {
      setEditableFilterChipDropdownStates(existingNonAdvancedRecordFilter);
      openDropdown({
        dropdownComponentInstanceIdFromProps: getEditableChipDropdownId({
          recordFilterId: existingNonAdvancedRecordFilter.id,
        }),
      });
      return;
    }

    const { newRecordFilter } = createEmptyRecordFilterFromFieldMetadataItem(
      correspondingFieldMetadataItem,
      relationTraversal?.targetFieldMetadataItem,
    );

    upsertRecordFilter(newRecordFilter);

    setEditableFilterChipDropdownStates(newRecordFilter);
    openDropdown({
      dropdownComponentInstanceIdFromProps: getEditableChipDropdownId({
        recordFilterId: newRecordFilter.id,
      }),
    });
  };

  return { openRecordFilterChipFromTableHeader };
};
