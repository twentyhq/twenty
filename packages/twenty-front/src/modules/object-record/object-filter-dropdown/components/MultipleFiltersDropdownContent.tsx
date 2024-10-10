import { ObjectFilterDropdownRatingInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRatingInput';
import { ObjectFilterDropdownSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSearchInput';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { ObjectFilterDropdownRecordSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSourceSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSourceSelect';
import { ObjectFilterDropdownTextSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownTextSearchInput';
import { isActorSourceCompositeFilter } from '@/object-record/object-filter-dropdown/utils/isActorSourceCompositeFilter';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { MultipleFiltersDropdownFilterOnFilterChangedEffect } from './MultipleFiltersDropdownFilterOnFilterChangedEffect';
import { ObjectFilterDropdownDateInput } from './ObjectFilterDropdownDateInput';
import { ObjectFilterDropdownFilterSelect } from './ObjectFilterDropdownFilterSelect';
import { ObjectFilterDropdownNumberInput } from './ObjectFilterDropdownNumberInput';
import { ObjectFilterDropdownOperandButton } from './ObjectFilterDropdownOperandButton';
import { ObjectFilterDropdownOperandSelect } from './ObjectFilterDropdownOperandSelect';
import { ObjectFilterDropdownOptionSelect } from './ObjectFilterDropdownOptionSelect';

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

  const isConfigurable =
    selectedOperandInDropdown &&
    [
      ViewFilterOperand.Is,
      ViewFilterOperand.IsNotNull,
      ViewFilterOperand.IsNot,
      ViewFilterOperand.LessThan,
      ViewFilterOperand.GreaterThan,
      ViewFilterOperand.IsBefore,
      ViewFilterOperand.IsAfter,
      ViewFilterOperand.Contains,
      ViewFilterOperand.DoesNotContain,
      ViewFilterOperand.IsRelative,
    ].includes(selectedOperandInDropdown);

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
          {isConfigurable && selectedOperandInDropdown && (
            <>
              {[
                'TEXT',
                'EMAIL',
                'EMAILS',
                'PHONE',
                'FULL_NAME',
                'LINK',
                'LINKS',
                'ADDRESS',
                'ACTOR',
                'ARRAY',
                'PHONES',
              ].includes(filterDefinitionUsedInDropdown.type) &&
                !isActorSourceCompositeFilter(
                  filterDefinitionUsedInDropdown,
                ) && <ObjectFilterDropdownTextSearchInput />}
              {['NUMBER', 'CURRENCY'].includes(
                filterDefinitionUsedInDropdown.type,
              ) && <ObjectFilterDropdownNumberInput />}
              {filterDefinitionUsedInDropdown.type === 'RATING' && (
                <ObjectFilterDropdownRatingInput />
              )}
              {['DATE_TIME', 'DATE'].includes(
                filterDefinitionUsedInDropdown.type,
              ) && <ObjectFilterDropdownDateInput />}
              {filterDefinitionUsedInDropdown.type === 'RELATION' && (
                <>
                  <ObjectFilterDropdownSearchInput />
                  <ObjectFilterDropdownRecordSelect />
                </>
              )}
              {isActorSourceCompositeFilter(filterDefinitionUsedInDropdown) && (
                <>
                  <DropdownMenuSeparator />
                  <ObjectFilterDropdownSourceSelect />
                </>
              )}
              {filterDefinitionUsedInDropdown.type === 'SELECT' && (
                <>
                  <ObjectFilterDropdownSearchInput />
                  <ObjectFilterDropdownOptionSelect />
                </>
              )}
            </>
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
