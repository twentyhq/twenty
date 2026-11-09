import { DashboardFilterEditModeChip } from '@/page-layout/components/DashboardFilterEditModeChip';
import { DashboardFilterViewModeChip } from '@/page-layout/components/DashboardFilterViewModeChip';
import { useDashboardFilters } from '@/page-layout/hooks/useDashboardFilters';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useSetDashboardFilterValue } from '@/page-layout/hooks/useSetDashboardFilterValue';
import { isPageLayoutFilterValueEqual } from '@/page-layout/utils/isPageLayoutFilterValueEqual';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';
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
  const { t } = useLingui();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const dashboardFilters = useDashboardFilters();
  const { resetDashboardFilterValues } = useSetDashboardFilterValue();

  if (!isDefined(dashboardFilters)) {
    return null;
  }

  const { pageLayoutFilters, urlValueByPageLayoutFilterId } = dashboardFilters;

  const pageLayoutFiltersDifferingFromDefault = pageLayoutFilters.filter(
    ({ id, defaultValue }) =>
      isDefined(urlValueByPageLayoutFilterId[id]) &&
      !isPageLayoutFilterValueEqual({
        firstValue: urlValueByPageLayoutFilterId[id],
        secondValue: defaultValue,
      }),
  );

  return (
    <StyledContainer>
      {pageLayoutFilters.map((pageLayoutFilter) =>
        isPageLayoutInEditMode ? (
          <DashboardFilterEditModeChip
            key={pageLayoutFilter.id}
            pageLayoutFilter={pageLayoutFilter}
          />
        ) : (
          <DashboardFilterViewModeChip
            key={pageLayoutFilter.id}
            pageLayoutFilter={pageLayoutFilter}
            urlValue={urlValueByPageLayoutFilterId[pageLayoutFilter.id]}
          />
        ),
      )}
      {!isPageLayoutInEditMode &&
        isNonEmptyArray(pageLayoutFiltersDifferingFromDefault) && (
          <LightButton emphasis="subtle" onClick={resetDashboardFilterValues}>
            {t`Reset`}
          </LightButton>
        )}
    </StyledContainer>
  );
};
