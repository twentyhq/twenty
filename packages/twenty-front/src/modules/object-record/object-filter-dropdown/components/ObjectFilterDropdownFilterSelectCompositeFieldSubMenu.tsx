import { useAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterDropdown';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownFirstLevelFilterDefinitionComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFirstLevelFilterDefinitionComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSubMenuFieldTypeComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSubMenuFieldTypeComponentState';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { getFilterableFieldTypeLabel } from '@/object-record/object-filter-dropdown/utils/getFilterableFieldTypeLabel';
import { getInitialFilterValue } from '@/object-record/object-filter-dropdown/utils/getInitialFilterValue';
import { getOperandsForFilterDefinition } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  IconApps,
  IconChevronLeft,
  isDefined,
  MenuItem,
  useIcons,
} from 'twenty-ui';

export const ObjectFilterDropdownFilterSelectCompositeFieldSubMenu = () => {
  const [searchText] = useState('');

  const { getIcon } = useIcons();

  const [
    objectFilterDropdownFirstLevelFilterDefinition,
    setObjectFilterDropdownFirstLevelFilterDefinition,
  ] = useRecoilComponentStateV2(
    objectFilterDropdownFirstLevelFilterDefinitionComponentState,
  );

  const [, setObjectFilterDropdownFilterIsSelected] = useRecoilComponentStateV2(
    objectFilterDropdownFilterIsSelectedComponentState,
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

  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
    selectFilter,
    advancedFilterViewFilterIdState,
    advancedFilterViewFilterGroupIdState,
  } = useFilterDropdown();

  const advancedFilterViewFilterId = useRecoilValue(
    advancedFilterViewFilterIdState,
  );
  const advancedFilterViewFilterGroupId = useRecoilValue(
    advancedFilterViewFilterGroupIdState,
  );

  const { closeAdvancedFilterDropdown } = useAdvancedFilterDropdown(
    advancedFilterViewFilterId,
  );

  const handleSelectFilter = (definition: FilterDefinition | null) => {
    if (definition !== null) {
      if (
        isDefined(advancedFilterViewFilterId) &&
        isDefined(advancedFilterViewFilterGroupId)
      ) {
        closeAdvancedFilterDropdown();

        const operand = getOperandsForFilterDefinition(definition)[0];
        const { value, displayValue } = getInitialFilterValue(
          definition.type,
          operand,
        );
        selectFilter({
          id: advancedFilterViewFilterId,
          fieldMetadataId: definition.fieldMetadataId,
          value,
          operand,
          displayValue,
          definition,
          viewFilterGroupId: advancedFilterViewFilterGroupId,
        });
      }

      setFilterDefinitionUsedInDropdown(definition);

      setSelectedOperandInDropdown(
        getOperandsForFilterDefinition(definition)[0],
      );

      setObjectFilterDropdownSearchInput('');

      setObjectFilterDropdownFilterIsSelected(true);
    }
  };

  const handleSubMenuBack = () => {
    setFilterDefinitionUsedInDropdown(null);
    setObjectFilterDropdownSubMenuFieldType(null);
    setObjectFilterDropdownFirstLevelFilterDefinition(null);
    setObjectFilterDropdownIsSelectingCompositeField(false);
    setObjectFilterDropdownFilterIsSelected(false);
  };

  if (
    !isDefined(objectFilterDropdownSubMenuFieldType) ||
    !isDefined(objectFilterDropdownFirstLevelFilterDefinition)
  ) {
    return null;
  }

  const options = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
    objectFilterDropdownSubMenuFieldType
  ].filterableSubFields
    .sort((a, b) => a.localeCompare(b))
    .filter((item) =>
      item.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
    );

  return (
    <>
      <DropdownMenuHeader
        StartIcon={IconChevronLeft}
        onClick={handleSubMenuBack}
      >
        {getFilterableFieldTypeLabel(objectFilterDropdownSubMenuFieldType)}
      </DropdownMenuHeader>
      {/* <StyledInput
        value={searchText}
        autoFocus
        placeholder="Search fields"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setSearchText(event.target.value)
        }
      /> */}
      <DropdownMenuItemsContainer>
        <MenuItem
          key={`select-filter-${-1}`}
          testId={`select-filter-${-1}`}
          onClick={() => {
            handleSelectFilter(objectFilterDropdownFirstLevelFilterDefinition);
          }}
          LeftIcon={IconApps}
          text={`Any ${getFilterableFieldTypeLabel(objectFilterDropdownSubMenuFieldType)} field`}
        />
        {/* TODO: fix this with a backend field on ViewFilter for composite field filter */}
        {objectFilterDropdownFirstLevelFilterDefinition.type === 'ACTOR' &&
          options.map((subFieldName, index) => (
            <MenuItem
              key={`select-filter-${index}`}
              testId={`select-filter-${index}`}
              onClick={() => {
                if (isDefined(objectFilterDropdownFirstLevelFilterDefinition)) {
                  handleSelectFilter({
                    ...objectFilterDropdownFirstLevelFilterDefinition,
                    label: getCompositeSubFieldLabel(
                      objectFilterDropdownSubMenuFieldType,
                      subFieldName,
                    ),
                    compositeFieldName: subFieldName,
                  });
                }
              }}
              text={getCompositeSubFieldLabel(
                objectFilterDropdownSubMenuFieldType,
                subFieldName,
              )}
              LeftIcon={getIcon(
                objectFilterDropdownFirstLevelFilterDefinition?.iconName,
              )}
            />
          ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
