import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';

import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { ObjectFilterDropdownFilterSelectCompositeFieldSubMenu } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectCompositeFieldSubMenu';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { MultipleFiltersDropdownFilterOnFilterChangedEffect } from './MultipleFiltersDropdownFilterOnFilterChangedEffect';
import { ObjectFilterDropdownFilterSelect } from './ObjectFilterDropdownFilterSelect';

const StyledContainer = styled.div`
  position: relative;
`;

type MultipleFiltersDropdownContentProps = {
  filterDropdownId?: string;
};

export const MultipleFiltersDropdownContent = ({
  filterDropdownId,
}: MultipleFiltersDropdownContentProps) => {
  const { filterDefinitionUsedInDropdownState } = useFilterDropdown({
    filterDropdownId,
  });

  const [objectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
      filterDropdownId,
    );

  const [objectFilterDropdownFilterIsSelected] = useRecoilComponentStateV2(
    objectFilterDropdownFilterIsSelectedComponentState,
    filterDropdownId,
  );

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );

  const shouldShowCompositeSelectionSubMenu =
    objectFilterDropdownIsSelectingCompositeField;

  const shoudShowFilterInput = objectFilterDropdownFilterIsSelected;

  return (
    <StyledContainer>
      {shoudShowFilterInput ? (
        <ObjectFilterDropdownFilterInput filterDropdownId={filterDropdownId} />
      ) : shouldShowCompositeSelectionSubMenu ? (
        <ObjectFilterDropdownFilterSelectCompositeFieldSubMenu />
      ) : (
        <ObjectFilterDropdownFilterSelect />
      )}
      <MultipleFiltersDropdownFilterOnFilterChangedEffect
        filterDefinitionUsedInDropdownType={
          filterDefinitionUsedInDropdown?.type
        }
      />
    </StyledContainer>
  );
};
