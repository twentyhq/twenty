import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

import { ObjectFilterSelectMenu } from '@/object-record/object-filter-dropdown/components/ObjectFilterSelectMenu';
import { ObjectFilterSelectSubMenu } from '@/object-record/object-filter-dropdown/components/ObjectFilterSelectSubMenu';
import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useSelectFilter } from '@/object-record/object-filter-dropdown/hooks/useSelectFilter';
import { currentSubMenuState } from '@/object-record/object-filter-dropdown/states/subMenuStates';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

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
  const [searchText, setSearchText] = useState('');

  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
  );

  const [currentSubMenu, setCurrentSubMenu] =
    useRecoilState(currentSubMenuState);

  const sortedAvailableFilterDefinitions = [...availableFilterDefinitions]
    .sort((a, b) => a.label.localeCompare(b.label))
    .filter((item) =>
      item.label.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
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

  useEffect(() => {
    return () => {
      setCurrentSubMenu(null);
    };
  }, [setCurrentSubMenu]);

  return !currentSubMenu ? (
    <ObjectFilterSelectMenu
      searchText={searchText}
      setSearchText={setSearchText}
      sortedAvailableFilterDefinitions={sortedAvailableFilterDefinitions}
      selectableListItemIds={selectableListItemIds}
      handleEnter={handleEnter}
    />
  ) : (
    <ObjectFilterSelectSubMenu />
  );
};
