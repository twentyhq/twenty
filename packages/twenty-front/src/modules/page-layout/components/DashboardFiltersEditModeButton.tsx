import { useIsThirdPartyApplication } from '@/applications/hooks/useIsThirdPartyApplication';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { LightButton } from 'twenty-ui/components/input';
import { IconFilter } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

export const DashboardFiltersEditModeButton = () => {
  const { t } = useLingui();

  const pageLayoutPersisted = useAtomComponentStateValue(
    pageLayoutPersistedComponentState,
  );

  const isOwnedByThirdPartyApplication = useIsThirdPartyApplication(
    pageLayoutPersisted?.applicationId,
  );

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  if (isOwnedByThirdPartyApplication) {
    return null;
  }

  const handleClick = () => {
    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.DashboardFilterSettings,
      resetNavigationStack: true,
    });
  };

  return (
    <StyledContainer>
      <LightButton startIcon={<IconFilter />} onClick={handleClick}>
        {t`Filters`}
      </LightButton>
    </StyledContainer>
  );
};
