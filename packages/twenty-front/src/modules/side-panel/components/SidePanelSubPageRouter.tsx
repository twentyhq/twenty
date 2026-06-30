import { SIDE_PANEL_SUB_PAGES_CONFIG } from '@/side-panel/constants/SidePanelSubPagesConfig';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelSubPageNavigationHeader } from '@/side-panel/pages/common/components/SidePanelSubPageNavigationHeader';
import { styled } from '@linaria/react';
import React, { type ReactNode } from 'react';
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
    throw new Error(
      `Missing side panel sub-page config for "${currentSidePanelSubPage.subPage}". ` +
        'Please add it to SIDE_PANEL_SUB_PAGES_CONFIG.',
    );
  }

  const keyedSubPageComponent = React.isValidElement(subPageComponent)
    ? React.cloneElement(subPageComponent, {
        key: currentSidePanelSubPage.id,
      })
    : subPageComponent;

  return (
    <StyledSubPageContainer>
      <SidePanelSubPageNavigationHeader
        title={currentSidePanelSubPage.title}
        onBackClick={goBackFromSidePanelSubPage}
      />
      {keyedSubPageComponent}
    </StyledSubPageContainer>
  );
};
