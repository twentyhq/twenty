import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/constants/PageBarMinHeight';
import {
  Breadcrumb,
  type BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { styled } from '@linaria/react';
import { useIsMobile } from 'twenty-ui/utilities';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type FullScreenContainerProps = {
  children: JSX.Element | JSX.Element[];
  links: BreadcrumbProps['links'];
  exitFullScreen(): void;
};

const StyledFullScreen = styled.div`
  background: ${themeCssVariables.background.noisy};
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledMainContainer = styled.div`
  height: calc(
    100% - ${PAGE_BAR_MIN_HEIGHT}px - ${themeCssVariables.spacing[9]}
  );
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[3]};
`;

const StyledPageHeaderContainer = styled.div`
  padding-left: ${themeCssVariables.spacing[3]};
`;

export const FullScreenContainer = ({
  children,
  links,
  exitFullScreen,
}: FullScreenContainerProps) => {
  const isMobile = useIsMobile();

  return (
    <StyledFullScreen>
      <StyledPageHeaderContainer>
        <PageHeader
          title={<Breadcrumb links={links} />}
          hasClosePageButton={!isMobile}
          onClosePage={exitFullScreen}
        />
      </StyledPageHeaderContainer>
      <StyledMainContainer>{children}</StyledMainContainer>
    </StyledFullScreen>
  );
};
