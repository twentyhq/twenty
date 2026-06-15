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
`;

const StyledMainCardWrapper = styled.div`
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  width: 0;
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 12px 0 0 12px;
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  width: 100%;
`;

const StyledBodyContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
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
          {header}
          {secondaryBar}
          <StyledBodyContent>
            {showInformationBanner && <InformationBannerWrapper />}
            {children}
          </StyledBodyContent>
        </StyledCard>
      </StyledMainCardWrapper>
    </StyledRoot>
  );
};
