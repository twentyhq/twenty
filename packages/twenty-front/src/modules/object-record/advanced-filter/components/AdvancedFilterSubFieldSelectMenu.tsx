import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useSelectFieldUsedInAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useSelectFieldUsedInAdvancedFilterDropdown';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSubMenuFieldTypeComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSubMenuFieldTypeComponentState';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { getFilterableFieldTypeLabel } from '@/object-record/object-filter-dropdown/utils/getFilterableFieldTypeLabel';
import { isCompositeFieldTypeSubFieldsFilterable } from '@/object-record/record-filter/utils/isCompositeFieldTypeFilterable';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { IconApps, IconChevronLeft, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type AdvancedFilterSubFieldSelectMenuProps = {
  recordFilterId: string;
};

export const AdvancedFilterSubFieldSelectMenu = ({
  recordFilterId,
}: AdvancedFilterSubFieldSelectMenuProps) => {
  const { getIcon } = useIcons();

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const [, setObjectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
    );

  const [
    objectFilterDropdownSubMenuFieldType,
    setObjectFilterDropdownSubMenuFieldType,
  ] = useRecoilComponentStateV2(
    objectFilterDropdownSubMenuFieldTypeComponentState,
  );

  const { closeAdvancedFilterFieldSelectDropdown } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const { selectFieldUsedInAdvancedFilterDropdown } =
    useSelectFieldUsedInAdvancedFilterDropdown();

  const handleSelectFilter = (
    selectedFieldMetadataItem: FieldMetadataItem | null | undefined,
    subFieldName?: string | null | undefined,
  ) => {
    if (!isDefined(selectedFieldMetadataItem)) {
      return;
    }

    selectFieldUsedInAdvancedFilterDropdown({
      fieldMetadataItemId: selectedFieldMetadataItem.id,
      recordFilterId,
      subFieldName,
    });

    closeAdvancedFilterFieldSelectDropdown();
  };

  const handleSubMenuBack = () => {
    setObjectFilterDropdownSubMenuFieldType(null);
    setObjectFilterDropdownIsSelectingCompositeField(false);
  };

  const { advancedFilterFieldSelectDropdownId } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const selectedItemId = useRecoilComponentValueV2(
    selectedItemIdComponentState,
    advancedFilterFieldSelectDropdownId,
  );

  if (!isDefined(objectFilterDropdownSubMenuFieldType)) {
    return null;
  }

  const options = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
    objectFilterDropdownSubMenuFieldType
  ].filterableSubFields.sort((a, b) => a.localeCompare(b));

  const subFieldsAreFilterable =
    isDefined(fieldMetadataItemUsedInDropdown) &&
    isCompositeFieldTypeSubFieldsFilterable(
      fieldMetadataItemUsedInDropdown.type,
    );

  const selectableItemIdArray = [
    '-1',
    ...options.map((subFieldName) => subFieldName),
  ];

  return (
    <>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={handleSubMenuBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {getFilterableFieldTypeLabel(objectFilterDropdownSubMenuFieldType)}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          hotkeyScope={advancedFilterFieldSelectDropdownId}
          selectableItemIdArray={selectableItemIdArray}
          selectableListInstanceId={advancedFilterFieldSelectDropdownId}
        >
          <SelectableListItem
            itemId={'-1'}
            key={`select-filter-${-1}`}
            onEnter={() => {
              handleSelectFilter(fieldMetadataItemUsedInDropdown);
            }}
          >
            <MenuItem
              selected={selectedItemId === '-1'}
              onClick={() => {
                handleSelectFilter(fieldMetadataItemUsedInDropdown);
              }}
              LeftIcon={IconApps}
              text={`Any ${getFilterableFieldTypeLabel(objectFilterDropdownSubMenuFieldType)} field`}
            />
          </SelectableListItem>
          {subFieldsAreFilterable &&
            options.map((subFieldName, index) => (
              <SelectableListItem
                itemId={subFieldName}
                key={`select-filter-${index}`}
                onEnter={() => {
                  handleSelectFilter(
                    fieldMetadataItemUsedInDropdown,
                    subFieldName,
                  );
                }}
              >
                <MenuItem
                  selected={selectedItemId === subFieldName}
                  key={`select-filter-${index}`}
                  testId={`select-filter-${index}`}
                  onClick={() => {
                    if (isDefined(fieldMetadataItemUsedInDropdown)) {
                      handleSelectFilter(
                        fieldMetadataItemUsedInDropdown,
                        subFieldName,
                      );
                    }
                  }}
                  text={getCompositeSubFieldLabel(
                    objectFilterDropdownSubMenuFieldType,
                    subFieldName,
                  )}
                  LeftIcon={getIcon(fieldMetadataItemUsedInDropdown?.icon)}
                />
              </SelectableListItem>
            ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
