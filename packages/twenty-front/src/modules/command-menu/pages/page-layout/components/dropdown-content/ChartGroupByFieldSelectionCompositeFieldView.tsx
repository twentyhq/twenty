import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { ICON_NAME_BY_SUB_FIELD } from '@/object-record/record-filter/constants/IconNameBySubField';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { IconChevronLeft, useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

type ChartGroupByFieldSelectionCompositeFieldViewProps = {
  compositeField: FieldMetadataItem;
  currentSubFieldName: string | undefined;
  onBack: () => void;
  onSelectSubField: (subFieldName: string) => void;
};

export const ChartGroupByFieldSelectionCompositeFieldView = ({
  compositeField,
  currentSubFieldName,
  onBack,
  onSelectSubField,
}: ChartGroupByFieldSelectionCompositeFieldViewProps) => {
  const { getIcon } = useIcons();

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const compositeFieldType = compositeField.type as CompositeFieldType;

  const subFieldNames = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
    compositeFieldType
  ].subFields.map((subField) => subField.subFieldName);

  return (
    <>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {compositeField.label}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={subFieldNames}
        >
          {subFieldNames.map((subFieldName) => (
            <SelectableListItem
              key={subFieldName}
              itemId={subFieldName}
              onEnter={() => {
                onSelectSubField(subFieldName);
              }}
            >
              <MenuItemSelect
                text={getCompositeSubFieldLabel(
                  compositeFieldType,
                  subFieldName,
                )}
                selected={currentSubFieldName === subFieldName}
                focused={selectedItemId === subFieldName}
                onClick={() => {
                  onSelectSubField(subFieldName);
                }}
                LeftIcon={getIcon(
                  ICON_NAME_BY_SUB_FIELD[subFieldName] ?? compositeField.icon,
                )}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
