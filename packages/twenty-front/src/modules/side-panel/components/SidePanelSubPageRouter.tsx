import { SIDE_PANEL_SUB_PAGES_CONFIG } from '@/side-panel/constants/SidePanelSubPagesConfig';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelSubPageNavigationHeader } from '@/side-panel/pages/common/components/SidePanelSubPageNavigationHeader';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledSubPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

type SidePanelSubPageRouterProps = {
  children: ReactNode;
};

export const SidePanelSubPageRouter = ({
  children,
}: SidePanelSubPageRouterProps) => {
  const { currentSidePanelSubPage, goBackFromSidePanelSubPage } =
    useSidePanelSubPageHistory();

  if (!isDefined(currentSidePanelSubPage)) {
    return <>{children}</>;
  }

  const subPageComponent = SIDE_PANEL_SUB_PAGES_CONFIG.get(
    currentSidePanelSubPage.subPage,
  );

  if (!isDefined(subPageComponent)) {
    return <>{children}</>;
  }

  return (
    <StyledSubPageContainer>
      <SidePanelSubPageNavigationHeader
        title={currentSidePanelSubPage.title}
        onBackClick={goBackFromSidePanelSubPage}
      />
      {subPageComponent}
    </StyledSubPageContainer>
  );
};
