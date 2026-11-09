import { DashboardFilterDropdown } from '@/page-layout/components/DashboardFilterDropdown';
import { DashboardFiltersEditModeButton } from '@/page-layout/components/DashboardFiltersEditModeButton';
import { useDashboardFilters } from '@/page-layout/hooks/useDashboardFilters';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  grid-column: 2;
  min-height: ${themeCssVariables.spacing[10]};
  padding-left: ${themeCssVariables.spacing[2]};
`;

export const DashboardFilterBar = () => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const dashboardFilters = useDashboardFilters();

  return (
    <StyledContainer>
      {dashboardFilters?.pageLayoutFilters.map((pageLayoutFilter) => (
        <DashboardFilterDropdown
          key={pageLayoutFilter.id}
          pageLayoutFilter={pageLayoutFilter}
          urlValue={
            dashboardFilters.urlValueByPageLayoutFilterId[pageLayoutFilter.id]
          }
        />
      ))}
      {isPageLayoutInEditMode && <DashboardFiltersEditModeButton />}
    </StyledContainer>
  );
};
