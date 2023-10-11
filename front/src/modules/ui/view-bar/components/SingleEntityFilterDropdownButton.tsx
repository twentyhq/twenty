import React from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { DropdownMenuContainer } from '@/ui/dropdown/components/DropdownMenuContainer';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { IconChevronDown } from '@/ui/icon';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { filterDefinitionUsedInDropdownScopedState } from '@/ui/view-bar/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '@/ui/view-bar/states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/view-bar/states/selectedOperandInDropdownScopedState';
import { ViewFilterOperand } from '~/generated/graphql';

import { StyledHeaderDropdownButton } from '../../dropdown/components/StyledHeaderDropdownButton';
import { useViewBarContext } from '../hooks/useViewBarContext';
import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { filtersScopedState } from '../states/filtersScopedState';
import { isFilterDropdownUnfoldedScopedState } from '../states/isFilterDropdownUnfoldedScopedState';
import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

import { FilterDropdownEntitySearchInput } from './FilterDropdownEntitySearchInput';
import { FilterDropdownEntitySelect } from './FilterDropdownEntitySelect';
import { GenericEntityFilterChip } from './GenericEntityFilterChip';

const StyledDropdownButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const SingleEntityFilterDropdownButton = ({
  hotkeyScope,
}: {
  hotkeyScope: HotkeyScope;
}) => {
  const theme = useTheme();

  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    ViewBarRecoilScopeContext,
  );
  const availableFilter = availableFilters[0];

  const [isFilterDropdownUnfolded, setIsFilterDropdownUnfolded] =
    useRecoilScopedState(
      isFilterDropdownUnfoldedScopedState,
      DropdownRecoilScopeContext,
    );

  const [filters] = useRecoilScopedState(
    filtersScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setFilterDropdownSearchInput] = useRecoilScopedState(
    filterDropdownSearchInputScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  React.useEffect(() => {
    setFilterDefinitionUsedInDropdown(availableFilter);
    const defaultOperand = getOperandsForFilterType(availableFilter?.type)[0];
    setSelectedOperandInDropdown(defaultOperand);
  }, [
    availableFilter,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
  ]);

  const setHotkeyScope = useSetHotkeyScope();

  const handleIsUnfoldedChange = (newIsUnfolded: boolean) => {
    if (newIsUnfolded) {
      setHotkeyScope(hotkeyScope.scope, hotkeyScope.customScopes);
      setIsFilterDropdownUnfolded(true);
    } else {
      setHotkeyScope(hotkeyScope.scope, hotkeyScope.customScopes);
      setIsFilterDropdownUnfolded(false);
      setFilterDropdownSearchInput('');
    }
  };

  return (
    <StyledDropdownButtonContainer data-select-disable>
      <StyledHeaderDropdownButton
        isUnfolded={isFilterDropdownUnfolded}
        onClick={() => handleIsUnfoldedChange(!isFilterDropdownUnfolded)}
      >
        {filters[0] ? (
          <GenericEntityFilterChip
            filter={filters[0]}
            Icon={
              filters[0].operand === ViewFilterOperand.IsNotNull
                ? availableFilter.SelectAllIcon
                : undefined
            }
          />
        ) : (
          'Filter'
        )}
        <IconChevronDown size={theme.icon.size.md} />
      </StyledHeaderDropdownButton>
      {isFilterDropdownUnfolded && (
        <DropdownMenuContainer onClose={() => handleIsUnfoldedChange(false)}>
          <FilterDropdownEntitySearchInput />
          <FilterDropdownEntitySelect />
        </DropdownMenuContainer>
      )}
    </StyledDropdownButtonContainer>
  );
};
