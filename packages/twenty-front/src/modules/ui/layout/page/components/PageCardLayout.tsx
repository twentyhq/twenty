import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  margin-left: -3px;
  min-width: 0;
  padding-left: 4px;
  width: 0;

  @media print {
    display: block;
    margin-left: 0;
    min-width: auto;
    padding-left: 0;
    width: auto;
  }
`;

// oxlint-disable-next-line twenty/no-hardcoded-colors
const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border-radius: 16px 0 0 0;
  box-shadow:
    -4px 0 4px 0 rgba(0, 0, 0, 0.006),
    0 0 0 1px ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  width: 100%;

  .dark & {
    box-shadow:
      -4px 0 4px 0 rgba(0, 0, 0, 0.03),
      0 0 0 1px ${themeCssVariables.border.color.medium};
  }

  @media print {
    border-radius: 0;
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
  return (
    <StyledRoot>
      <StyledMainCardWrapper>
        <StyledCard>
          <StyledPrintHidden>{header}</StyledPrintHidden>
          <StyledPrintHidden>{secondaryBar}</StyledPrintHidden>
          <StyledBodyContent>
            {showInformationBanner && (
              <StyledPrintHidden>
                <InformationBannerWrapper />
              </StyledPrintHidden>
            )}
            {children}
          </StyledBodyContent>
        </StyledCard>
      </StyledMainCardWrapper>
    </StyledRoot>
  );
};
