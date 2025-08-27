import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/constants/PageBarMinHeight';
import {
  Breadcrumb,
  type BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import styled from '@emotion/styled';
import { useIsMobile } from 'twenty-ui/utilities';

type FullScreenContainerProps = {
  children: JSX.Element | JSX.Element[];
  links: BreadcrumbProps['links'];
  exitFullScreen(): void;
};

const StyledFullScreen = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledMainContainer = styled.div`
  height: calc(
    100% - ${PAGE_BAR_MIN_HEIGHT}px - ${({ theme }) => theme.spacing(2 * 2 + 5)}
  );
  padding: ${({ theme }) =>
    `0 ${theme.spacing(3)} ${theme.spacing(3)} ${theme.spacing(3)}`};
`;

const StyledPageHeader = styled(PageHeader)`
  padding-left: ${({ theme }) => theme.spacing(3)};
`;

export const FullScreenContainer = ({
  children,
  links,
  exitFullScreen,
}: FullScreenContainerProps) => {
  const isMobile = useIsMobile();

  return (
    <StyledFullScreen>
      <StyledPageHeader
        title={<Breadcrumb links={links} />}
        hasClosePageButton={!isMobile}
        onClosePage={exitFullScreen}
      />
      <StyledMainContainer>{children}</StyledMainContainer>
    </StyledFullScreen>
  );
};
