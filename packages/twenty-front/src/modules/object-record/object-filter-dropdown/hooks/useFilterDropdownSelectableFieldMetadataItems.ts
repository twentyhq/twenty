import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

export const useFilterDropdownSelectableFieldMetadataItems = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const objectFilterDropdownSearchInput = useRecoilComponentValueV2(
    objectFilterDropdownSearchInputComponentState,
  );

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const visibleRecordFields = useRecoilComponentSelectorValueV2(
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
