import { InformationBannerWrapper } from '@/information-banner/components/InformationBannerWrapper';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type PageCardLayoutProps = {
  header: ReactNode;
  secondaryBar?: ReactNode;
  children: ReactNode;
};

const StyledRoot = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: row;
  min-height: 0;
  min-width: 0;
  padding: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[1] : themeCssVariables.spacing[2]};
`;

const StyledMainCardWrapper = styled.div`
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  width: 0;
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
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

// The page chrome shared by Settings and record pages: a single rounded card
// holding a primary bar, an optional secondary bar, and the body. The side
// panel renders as a sibling of this card (in MainAppLayoutWithSidePanel).
export const PageCardLayout = ({
  header,
  secondaryBar,
  children,
}: PageCardLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <StyledRoot isMobile={isMobile}>
      <StyledMainCardWrapper>
        <StyledCard>
          {header}
          {isDefined(secondaryBar) && secondaryBar}
          <StyledBodyContent>
            <InformationBannerWrapper />
            {children}
          </StyledBodyContent>
        </StyledCard>
      </StyledMainCardWrapper>
    </StyledRoot>
  );
};
