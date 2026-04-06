import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FILTER_FIELD_LIST_ID } from '@/object-record/object-filter-dropdown/constants/FilterFieldListId';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown } from '@/views/hooks/useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown';
import { useAICElement } from '@aicorg/sdk-react';
import { useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export type ViewBarFilterDropdownFieldSelectMenuItemProps = {
  fieldMetadataItemToSelect: FieldMetadataItem;
};

export const ViewBarFilterDropdownFieldSelectMenuItem = ({
  fieldMetadataItemToSelect,
}: ViewBarFilterDropdownFieldSelectMenuItemProps) => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { resetSelectedItem } = useSelectableList(FILTER_FIELD_LIST_ID);

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    fieldMetadataItemToSelect.id,
  );

  const { initializeFilterOnFieldMetataItemFromViewBarFilterDropdown } =
    useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown();

  const { getIcon } = useIcons();

  const Icon = getIcon(fieldMetadataItemToSelect.icon);
  const { attributes } = useAICElement({
    agentId: `${objectMetadataItem.nameSingular}.view.filter.field.${fieldMetadataItemToSelect.name}`,
    agentAction: 'select',
    agentDescription: `Initialize a list filter on the ${fieldMetadataItemToSelect.label} field for the current ${objectMetadataItem.labelPlural} view.`,
    agentEntityId: fieldMetadataItemToSelect.id,
    agentEntityLabel: fieldMetadataItemToSelect.label,
    agentEntityType: `${objectMetadataItem.nameSingular}_field`,
    agentLabel: `Filter ${objectMetadataItem.labelPlural} by ${fieldMetadataItemToSelect.label}`,
    agentRisk: 'low',
    agentWorkflowStep: `${objectMetadataItem.nameSingular}.view.select_filter_field`,
  });

  const handleClick = () => {
    resetSelectedItem();

    initializeFilterOnFieldMetataItemFromViewBarFilterDropdown(
      fieldMetadataItemToSelect,
    );
  };

  return (
    <SelectableListItem
      itemId={fieldMetadataItemToSelect.id}
      onEnter={handleClick}
    >
      <MenuItem
        focused={isSelectedItemId}
        onClick={handleClick}
        LeftIcon={Icon}
        text={fieldMetadataItemToSelect.label}
        {...attributes}
      />
    </SelectableListItem>
  );
};
