import { DashboardFilterEditModeChip } from '@/page-layout/components/DashboardFilterEditModeChip';
import { DashboardFilterViewModeChip } from '@/page-layout/components/DashboardFilterViewModeChip';
import { useDashboardFilters } from '@/page-layout/hooks/useDashboardFilters';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useSetDashboardFilterValue } from '@/page-layout/hooks/useSetDashboardFilterValue';
import { isPageLayoutFilterValueEqual } from '@/page-layout/utils/isPageLayoutFilterValueEqual';
import { TAB_LIST_HEIGHT } from '@/ui/layout/tab-list/constants/TabListHeight';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  margin-left: auto;
  min-height: ${TAB_LIST_HEIGHT};
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
      {/* Before the controls, so they keep their place at the right edge */}
      {!isPageLayoutInEditMode &&
        isNonEmptyArray(pageLayoutFiltersDifferingFromDefault) && (
          <LightButton
            emphasis="subtle"
            data-testid="cancel-button"
            onClick={resetDashboardFilterValues}
          >
            {t`Reset`}
          </LightButton>
        )}
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
    </StyledContainer>
  );
};
