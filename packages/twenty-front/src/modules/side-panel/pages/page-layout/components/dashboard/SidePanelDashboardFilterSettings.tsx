import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraftFiltersComponentSelector } from '@/page-layout/states/selectors/pageLayoutDraftFiltersComponentSelector';
import { getNewPageLayoutFilterLabel } from '@/page-layout/utils/getNewPageLayoutFilterLabel';
import { DashboardFilterSettingsCard } from '@/side-panel/pages/page-layout/components/dashboard/DashboardFilterSettingsCard';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { v4 as uuidv4 } from 'uuid';
import { PageLayoutFilterType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledDescription = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

export const SidePanelDashboardFilterSettings = () => {
  const { t } = useLingui();
  const { pageLayoutId } = usePageLayoutSidePanelTarget();

  const pageLayoutFilters = useAtomComponentSelectorValue(
    pageLayoutDraftFiltersComponentSelector,
    pageLayoutId,
  );

  const setPageLayoutDraft = useSetAtomComponentState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const handleAddFilter = () => {
    setPageLayoutDraft((pageLayoutDraft) => {
      const filters = pageLayoutDraft.filters ?? [];

      return {
        ...pageLayoutDraft,
        filters: [
          ...filters,
          {
            id: uuidv4(),
            label: getNewPageLayoutFilterLabel(filters),
            type: PageLayoutFilterType.DATE,
            position:
              Math.max(-1, ...filters.map(({ position }) => position)) + 1,
            defaultValue: null,
          },
        ],
      };
    });
  };

  return (
    <StyledContainer>
      <StyledDescription>
        {t`A date filter applies to every data widget, on the date it groups by, else the date it filters on, else its creation date. Change that per widget below.`}
      </StyledDescription>
      {(pageLayoutFilters ?? []).map((pageLayoutFilter) => (
        <DashboardFilterSettingsCard
          key={pageLayoutFilter.id}
          pageLayoutId={pageLayoutId}
          pageLayoutFilter={pageLayoutFilter}
        />
      ))}
      <div>
        <Button
          variant="outline"
          size="sm"
          startIcon={<IconPlus />}
          onClick={handleAddFilter}
        >{t`Add date filter`}</Button>
      </div>
    </StyledContainer>
  );
};
