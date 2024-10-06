import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { ViewFilter } from '@/views/types/ViewFilter';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import styled from '@emotion/styled';

const StyledRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

interface AdvancedFilterViewFilterProps {
  viewFilter: ViewFilter;
}

export const AdvancedFilterViewFilter = (
  props: AdvancedFilterViewFilterProps,
) => {
  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
  );

  const [filter] = mapViewFiltersToFilters(
    [props.viewFilter],
    availableFilterDefinitions,
  );

  return <StyledRow>{filter.displayValue}</StyledRow>;
};
