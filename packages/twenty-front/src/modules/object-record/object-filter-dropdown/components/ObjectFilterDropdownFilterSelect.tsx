import styled from '@emotion/styled';
import { useState } from 'react';

import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { ObjectFilterDropdownFilterSelectCompositeFieldSubMenu } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectCompositeFieldSubMenu';
import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { useSelectFilter } from '@/object-record/object-filter-dropdown/hooks/useSelectFilter';
import { CompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/types/CompositeFilterableFieldType';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { useRecoilValue } from 'recoil';
import { isDefined, useIcons } from 'twenty-ui';
import { getOperandsForFilterDefinition } from '../utils/getOperandsForFilterType';

export const StyledInput = styled.input`
  background: transparent;
  border: none;
  border-top: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 0;
  border-top-left-radius: ${({ theme }) => theme.border.radius.md};
  border-top-right-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  height: 19px;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};

  font-weight: inherit;
  max-width: 100%;
  overflow: hidden;
  text-decoration: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

export const ObjectFilterDropdownFilterSelect = () => {
  const [subMenuFieldType, setSubMenuFieldType] =
    useState<CompositeFilterableFieldType | null>(null);

  const [firstLevelFilterDefinition, setFirstLevelFilterDefinition] =
    useState<FilterDefinition | null>(null);

  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
    objectFilterDropdownSearchInputState,
  } = useFilterDropdown();

  const objectFilterDropdownSearchInput = useRecoilValue(
    objectFilterDropdownSearchInputState,
  );

  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
  );

  const sortedAvailableFilterDefinitions = [...availableFilterDefinitions]
    .sort((a, b) => a.label.localeCompare(b.label))
    .filter((item) =>
      item.label
        .toLocaleLowerCase()
        .includes(objectFilterDropdownSearchInput.toLocaleLowerCase()),
    );

  const selectableListItemIds = sortedAvailableFilterDefinitions.map(
    (item) => item.fieldMetadataId,
  );

  const { selectFilter } = useSelectFilter();

  const { resetSelectedItem } = useSelectableList(OBJECT_FILTER_DROPDOWN_ID);

  const handleEnter = (itemId: string) => {
    const selectedFilterDefinition = sortedAvailableFilterDefinitions.find(
      (item) => item.fieldMetadataId === itemId,
    );

    if (!isDefined(selectedFilterDefinition)) {
      return;
    }

    resetSelectedItem();

    selectFilter({ filterDefinition: selectedFilterDefinition });
  };

  const setHotkeyScope = useSetHotkeyScope();
  const { getIcon } = useIcons();

  const handleSelectFilter = (availableFilterDefinition: FilterDefinition) => {
    setFilterDefinitionUsedInDropdown(availableFilterDefinition);

    if (
      availableFilterDefinition.type === 'RELATION' ||
      availableFilterDefinition.type === 'SELECT'
    ) {
      setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
    }

    setSelectedOperandInDropdown(
      getOperandsForFilterDefinition(availableFilterDefinition)[0],
    );

    setObjectFilterDropdownSearchInput('');
  };

  const handleSubMenuBack = () => {
    setSubMenuFieldType(null);
    setFirstLevelFilterDefinition(null);
  };

  const shouldShowFirstLevelMenu = !isDefined(subMenuFieldType);

  return (
    <>
      {shouldShowFirstLevelMenu ? (
        <>
          <StyledInput
            value={objectFilterDropdownSearchInput}
            autoFocus
            placeholder="Search fields"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setObjectFilterDropdownSearchInput(event.target.value)
            }
          />
          <SelectableList
            hotkeyScope={FiltersHotkeyScope.ObjectFilterDropdownButton}
            selectableItemIdArray={selectableListItemIds}
            selectableListId={OBJECT_FILTER_DROPDOWN_ID}
            onEnter={handleEnter}
          >
            <DropdownMenuItemsContainer>
              {[...availableFilterDefinitions]
                .sort((a, b) => a.label.localeCompare(b.label))
                .filter((item) =>
                  item.label
                    .toLocaleLowerCase()
                    .includes(
                      objectFilterDropdownSearchInput.toLocaleLowerCase(),
                    ),
                )
                .map((availableFilterDefinition, index) => (
                  <SelectableItem
                    itemId={availableFilterDefinition.fieldMetadataId}
                  >
                    <MenuItem
                      key={`select-filter-${index}`}
                      testId={`select-filter-${index}`}
                      onClick={() => {
                        if (isCompositeField(availableFilterDefinition.type)) {
                          setSubMenuFieldType(availableFilterDefinition.type);
                          setFirstLevelFilterDefinition(
                            availableFilterDefinition,
                          );
                        } else {
                          handleSelectFilter(availableFilterDefinition);
                        }
                      }}
                      LeftIcon={getIcon(availableFilterDefinition.iconName)}
                      text={availableFilterDefinition.label}
                      hasSubMenu={isCompositeField(
                        availableFilterDefinition.type,
                      )}
                    />
                  </SelectableItem>
                ))}
            </DropdownMenuItemsContainer>
          </SelectableList>
        </>
      ) : (
        <ObjectFilterDropdownFilterSelectCompositeFieldSubMenu
          fieldType={subMenuFieldType}
          firstLevelFieldDefinition={firstLevelFilterDefinition}
          onBack={handleSubMenuBack}
        />
      )}
    </>
  );
};
