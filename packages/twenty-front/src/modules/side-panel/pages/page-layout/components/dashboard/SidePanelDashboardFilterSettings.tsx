import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { DashboardFilterSettingsCard } from '@/side-panel/pages/page-layout/components/dashboard/DashboardFilterSettingsCard';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
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

  const [pageLayoutDraft, setPageLayoutDraft] = useAtomComponentState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutFilters = pageLayoutDraft.filters ?? [];

  const handleAddFilter = () => {
    const filterNumber = pageLayoutFilters.length + 1;

    setPageLayoutDraft({
      ...pageLayoutDraft,
      filters: [
        ...pageLayoutFilters,
        {
          id: uuidv4(),
          label: filterNumber === 1 ? t`Period` : t`Period ${filterNumber}`,
          type: PageLayoutFilterType.DATE,
          position:
            Math.max(-1, ...pageLayoutFilters.map(({ position }) => position)) +
            1,
          defaultValue: null,
        },
      ],
    });
  };

  return (
    <StyledContainer>
      <StyledDescription>
        {t`Add a date filter, then choose in each widget's settings which date field it filters.`}
      </StyledDescription>
      {pageLayoutFilters.map((pageLayoutFilter) => (
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
