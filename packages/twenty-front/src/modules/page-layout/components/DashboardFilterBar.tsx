import { DashboardFilterDropdown } from '@/page-layout/components/DashboardFilterDropdown';
import { DashboardFiltersEditModeButton } from '@/page-layout/components/DashboardFiltersEditModeButton';
import { useDashboardFilterValues } from '@/page-layout/hooks/useDashboardFilterValues';
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
  const { pageLayoutFilters } = useDashboardFilterValues();

  const sortedPageLayoutFilters = [...pageLayoutFilters].sort(
    (firstFilter, secondFilter) => firstFilter.position - secondFilter.position,
  );

  return (
    <StyledContainer>
      {sortedPageLayoutFilters.map(({ id, label }) => (
        <DashboardFilterDropdown
          key={id}
          pageLayoutFilterId={id}
          label={label}
        />
      ))}
      {isPageLayoutInEditMode && <DashboardFiltersEditModeButton />}
    </StyledContainer>
  );
};
