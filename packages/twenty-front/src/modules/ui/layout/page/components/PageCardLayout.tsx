import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

type PageCardLayoutProps = {
  header: ReactNode;
  secondaryBar?: ReactNode;
  children: ReactNode;
  showInformationBanner?: boolean;
};

const StyledRoot = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  min-height: 0;
  min-width: 0;

  @media print {
    display: block;
    min-height: auto;
    min-width: auto;
  }
`;

const StyledMainCardWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  width: 0;

  @media print {
    display: block;
    min-width: auto;
    width: auto;
  }
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 0;
  box-shadow: ${themeCssVariables.boxShadow.sidebar};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-left: none;
    box-shadow: none;
  }

  @media print {
    border-left: none;
    box-shadow: none;
    display: block;
    min-height: auto;
    overflow: visible;
  }
`;

const StyledBodyContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;

  @media print {
    display: block;
    min-height: auto;
  }
`;

const StyledSidePanelSurface = styled.div`
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const StyledPrintHidden = styled.div`
  @media print {
    display: none;
  }
`;

export const PageCardLayout = ({
  header,
  secondaryBar,
  children,
  showInformationBanner = true,
}: PageCardLayoutProps) => {
  const workspaceSurface = useWorkspaceSurface();
  const shouldShowInformationBanner =
    showInformationBanner && workspaceSurface.type === 'main';

  const body = <StyledBodyContent>{children}</StyledBodyContent>;

  if (workspaceSurface.type === 'side-panel') {
    return (
      <StyledSidePanelSurface data-page-surface="side-panel">
        {header}
        <StyledPrintHidden>{secondaryBar}</StyledPrintHidden>
        {body}
      </StyledSidePanelSurface>
    );
  }

  return (
    <StyledRoot data-page-surface="main">
      <StyledMainCardWrapper>
        <StyledCard>
          <StyledPrintHidden>{header}</StyledPrintHidden>
          {shouldShowInformationBanner && (
            <StyledPrintHidden>
              <InformationBannerWrapper />
            </StyledPrintHidden>
          )}
          <StyledPrintHidden>{secondaryBar}</StyledPrintHidden>
          {body}
        </StyledCard>
      </StyledMainCardWrapper>
    </StyledRoot>
  );
};
