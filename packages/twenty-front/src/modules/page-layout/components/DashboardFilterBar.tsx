import { DashboardFilterEditModeChip } from '@/page-layout/components/DashboardFilterEditModeChip';
import { pageLayoutDraftFiltersComponentSelector } from '@/page-layout/states/selectors/pageLayoutDraftFiltersComponentSelector';
import { TAB_LIST_HEIGHT } from '@/ui/layout/tab-list/constants/TabListHeight';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { getEffectiveDashboardPageLayoutFilters } from 'twenty-shared/utils';
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
  const pageLayoutDraftFilters = useAtomComponentSelectorValue(
    pageLayoutDraftFiltersComponentSelector,
  );

  return (
    <StyledContainer>
      {getEffectiveDashboardPageLayoutFilters(pageLayoutDraftFilters).map(
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
