import { AdvancedFilterViewFilterFieldSelect } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterFieldSelect';
import { AdvancedFilterViewFilterOperandSelect } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterOperandSelect';
import { AdvancedFilterViewFilterValueInput } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilterValueInput';

import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';

const StyledValueDropdownContainer = styled.div`
  flex: 3;
`;

const StyledRow = styled.div`
  flex: 1;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
  overflow: hidden;
`;

type AdvancedFilterViewFilterProps = {
  viewFilterId: string;
};

export const AdvancedFilterViewFilter = ({
  viewFilterId,
}: AdvancedFilterViewFilterProps) => {
  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === viewFilterId,
  );

  if (!isDefined(recordFilter)) {
    return null;
  }

  return (
    <ObjectFilterDropdownComponentInstanceContext.Provider
      value={{ instanceId: recordFilter.id }}
    >
      <StyledRow>
        <AdvancedFilterViewFilterFieldSelect viewFilterId={recordFilter.id} />
        <AdvancedFilterViewFilterOperandSelect viewFilterId={recordFilter.id} />
        <StyledValueDropdownContainer>
          {configurableViewFilterOperands.has(recordFilter.operand) && (
            <AdvancedFilterViewFilterValueInput
              viewFilterId={recordFilter.id}
            />
          )}
        </StyledValueDropdownContainer>
      </StyledRow>
    </ObjectFilterDropdownComponentInstanceContext.Provider>
  );
};
