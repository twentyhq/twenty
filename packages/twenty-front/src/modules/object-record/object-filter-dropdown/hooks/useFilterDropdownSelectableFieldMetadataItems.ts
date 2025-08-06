import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useFilterDropdownSelectableFieldMetadataItems = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const objectFilterDropdownSearchInput = useRecoilComponentValue(
    objectFilterDropdownSearchInputComponentState,
  );

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const visibleTableColumns = useRecoilComponentValue(
    visibleTableColumnsComponentSelector,
    recordIndexId,
  );

  const visibleColumnsIds = visibleTableColumns.map(
    (column) => column.fieldMetadataId,
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
          visibleColumnsIds.indexOf(a.id) - visibleColumnsIds.indexOf(b.id)
        );
      })
      .filter((fieldMetadataItem) =>
        visibleColumnsIds.includes(fieldMetadataItem.id),
      );

  const selectableHiddenFieldMetadataItems =
    filteredSearchInputFieldMetadataItems
      .sort((a, b) => a.label.localeCompare(b.label))
      .filter(
        (fieldMetadataItem) =>
          !visibleColumnsIds.includes(fieldMetadataItem.id),
      );

  return {
    selectableVisibleFieldMetadataItems,
    selectableHiddenFieldMetadataItems,
  };
};
