import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';

import { ConfigurableFilterDropdownContent } from '@/object-record/object-filter-dropdown/components/ConfigurableFilterDropdownContent';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { MultipleFiltersDropdownFilterOnFilterChangedEffect } from './MultipleFiltersDropdownFilterOnFilterChangedEffect';
import { ObjectFilterDropdownFilterSelect } from './ObjectFilterDropdownFilterSelect';
import { ObjectFilterDropdownOperandButton } from './ObjectFilterDropdownOperandButton';
import { ObjectFilterDropdownOperandSelect } from './ObjectFilterDropdownOperandSelect';

const StyledContainer = styled.div`
  position: relative;
`;

const StyledOperandSelectContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  left: 10px;
  position: absolute;
  top: 10px;
  width: 100%;
  z-index: 1000;
`;

type MultipleFiltersDropdownContentProps = {
  filterDropdownId?: string;
};

export const MultipleFiltersDropdownContent = ({
  filterDropdownId,
}: MultipleFiltersDropdownContentProps) => {
  const {
    filterDefinitionUsedInDropdownState,
    selectedOperandInDropdownState,
    isObjectFilterDropdownOperandSelectUnfoldedState,
  } = useFilterDropdown({ filterDropdownId });

  const isObjectFilterDropdownOperandSelectUnfolded = useRecoilValue(
    isObjectFilterDropdownOperandSelectUnfoldedState,
  );

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );

  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );

  const isConfigurableViewFilterOperand =
    selectedOperandInDropdown &&
    configurableViewFilterOperands.has(selectedOperandInDropdown);

  return (
    <StyledContainer>
      {!filterDefinitionUsedInDropdown ? (
        <ObjectFilterDropdownFilterSelect />
      ) : (
        <>
          <ObjectFilterDropdownOperandButton />
          {isObjectFilterDropdownOperandSelectUnfolded && (
            <StyledOperandSelectContainer>
              <ObjectFilterDropdownOperandSelect />
            </StyledOperandSelectContainer>
          )}
          {isConfigurableViewFilterOperand && selectedOperandInDropdown && (
            <ConfigurableFilterDropdownContent
              filterDefinitionUsedInDropdown={filterDefinitionUsedInDropdown}
            />
          )}
        </>
      )}
      <MultipleFiltersDropdownFilterOnFilterChangedEffect
        filterDefinitionUsedInDropdownType={
          filterDefinitionUsedInDropdown?.type
        }
      />
    </StyledContainer>
  );
};
