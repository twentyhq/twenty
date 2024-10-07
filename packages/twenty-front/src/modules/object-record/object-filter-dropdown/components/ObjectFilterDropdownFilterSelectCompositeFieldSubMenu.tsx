import { StyledInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { CompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/types/CompositeFilterableFieldType';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { getFilterableFieldTypeLabel } from '@/object-record/object-filter-dropdown/utils/getFilterableFieldTypeLabel';
import { getOperandsForFilterDefinition } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useState } from 'react';
import { IconApps, IconChevronLeft, useIcons } from 'twenty-ui';

type ObjectFilterDropdownFilterSelectCompositeFieldSubMenuProps = {
  fieldType: CompositeFilterableFieldType;
  firstLevelFieldDefinition: FilterDefinition | null;
  onBack: () => void;
};

export const ObjectFilterDropdownFilterSelectCompositeFieldSubMenu = ({
  fieldType,
  firstLevelFieldDefinition,
  onBack,
}: ObjectFilterDropdownFilterSelectCompositeFieldSubMenuProps) => {
  const [searchText, setSearchText] = useState('');

  const { getIcon } = useIcons();

  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
  } = useFilterDropdown();

  const handleSelectFilter = (definition: FilterDefinition | null) => {
    if (definition !== null) {
      setFilterDefinitionUsedInDropdown(definition);

      setSelectedOperandInDropdown(
        getOperandsForFilterDefinition(definition)[0],
      );

      setObjectFilterDropdownSearchInput('');
    }
  };

  const options = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
    fieldType
  ].filterableSubFields
    .sort((a, b) => a.localeCompare(b))
    .filter((item) =>
      item.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
    );

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={onBack}>
        {getFilterableFieldTypeLabel(fieldType)}
      </DropdownMenuHeader>
      <StyledInput
        value={searchText}
        autoFocus
        placeholder="Search fields"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setSearchText(event.target.value)
        }
      />
      <DropdownMenuItemsContainer>
        <MenuItem
          key={`select-filter-${-1}`}
          testId={`select-filter-${-1}`}
          onClick={() => {
            handleSelectFilter(firstLevelFieldDefinition);
          }}
          LeftIcon={IconApps}
          text={`Any ${getFilterableFieldTypeLabel(fieldType)} field`}
        />
        {options.map((subFieldName, index) => (
          <MenuItem
            key={`select-filter-${index}`}
            testId={`select-filter-${index}`}
            onClick={() =>
              firstLevelFieldDefinition &&
              handleSelectFilter({
                ...firstLevelFieldDefinition,
                label: getCompositeSubFieldLabel(fieldType, subFieldName),
                compositeFieldName: subFieldName,
              })
            }
            text={getCompositeSubFieldLabel(fieldType, subFieldName)}
            LeftIcon={getIcon(firstLevelFieldDefinition?.iconName)}
          />
        ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
