import { DashboardFilterEditModeChip } from '@/page-layout/components/DashboardFilterEditModeChip';
import { pageLayoutDraftFiltersComponentSelector } from '@/page-layout/states/selectors/pageLayoutDraftFiltersComponentSelector';
import { getDashboardPageLayoutFilters } from '@/page-layout/utils/getDashboardPageLayoutFilters';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  grid-column: 2;
  min-height: ${themeCssVariables.spacing[10]};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

export const DashboardFilterBar = () => {
  const pageLayoutDraftFilters = useAtomComponentSelectorValue(
    pageLayoutDraftFiltersComponentSelector,
  );

  return (
    <StyledContainer>
      {getDashboardPageLayoutFilters(pageLayoutDraftFilters).map(
        (pageLayoutFilter) => (
          <DashboardFilterEditModeChip
            key={pageLayoutFilter.id}
            pageLayoutFilter={pageLayoutFilter}
          />
        ),
      )}
    </StyledContainer>
  );
};
