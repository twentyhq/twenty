import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useFilterDropdownSelectableFieldMetadataItems = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const objectFilterDropdownSearchInput = useRecoilComponentValue(
    objectFilterDropdownSearchInputComponentState,
  );

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
    recordIndexId,
  );

  const visibleFieldMetadataItemIds = visibleRecordFields.map(
    (recordField) => recordField.fieldMetadataItemId,
  );

  const filteredSearchInputFieldMetadataItems =
    filterableFieldMetadataItems.filter((fieldMetadataItem) =>
      fieldMetadataItem.label
        .toLocaleLowerCase()
        .includes(objectFilterDropdownSearchInput.toLocaleLowerCase()),
    );

  const selectableVisibleFieldMetadataItems =
    filteredSearchInputFieldMetadataItems
      .sort((a, b) => {
        return (
          visibleFieldMetadataItemIds.indexOf(a.id) -
          visibleFieldMetadataItemIds.indexOf(b.id)
        );
      })
      .filter((fieldMetadataItem) =>
        visibleFieldMetadataItemIds.includes(fieldMetadataItem.id),
      );

  const selectableHiddenFieldMetadataItems =
    filteredSearchInputFieldMetadataItems
      .sort((a, b) => a.label.localeCompare(b.label))
      .filter(
        (fieldMetadataItem) =>
          !visibleFieldMetadataItemIds.includes(fieldMetadataItem.id),
      );

  return {
    selectableVisibleFieldMetadataItems,
    selectableHiddenFieldMetadataItems,
  };
};
