import { Context } from 'react';
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

import { StyledHeaderDropdownButton } from '../../dropdown/components/StyledHeaderDropdownButton';
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
  context,
  hotkeyScope,
}: {
  context: Context<string | null>;
  hotkeyScope: HotkeyScope;
}) => {
  const theme = useTheme();

  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    context,
  );
  const availableFilter = availableFilters[0];

  const [isFilterDropdownUnfolded, setIsFilterDropdownUnfolded] =
    useRecoilScopedState(
      isFilterDropdownUnfoldedScopedState,
      DropdownRecoilScopeContext,
    );

  const [filters] = useRecoilScopedState(filtersScopedState, context);

  const [, setFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    context,
  );

  const [, setFilterDropdownSearchInput] = useRecoilScopedState(
    filterDropdownSearchInputScopedState,
    context,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    context,
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
    <StyledDropdownButtonContainer>
      <StyledHeaderDropdownButton
        isUnfolded={isFilterDropdownUnfolded}
        onClick={() => handleIsUnfoldedChange(!isFilterDropdownUnfolded)}
      >
        {filters[0] ? (
          <GenericEntityFilterChip filter={filters[0]} />
        ) : (
          'Filter'
        )}
        <IconChevronDown size={theme.icon.size.md} />
      </StyledHeaderDropdownButton>
      {isFilterDropdownUnfolded && (
        <DropdownMenuContainer onClose={() => handleIsUnfoldedChange(false)}>
          <FilterDropdownEntitySearchInput context={context} />
          <FilterDropdownEntitySelect context={context} />
        </DropdownMenuContainer>
      )}
    </StyledDropdownButtonContainer>
  );
};
