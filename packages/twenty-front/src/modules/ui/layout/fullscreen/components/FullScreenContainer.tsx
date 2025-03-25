import {
  PAGE_BAR_MIN_HEIGHT,
  PageHeader,
} from '@/ui/layout/page/components/PageHeader';
import {
  Breadcrumb,
  BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconButton, IconX, useIsMobile } from 'twenty-ui';

type FullScreenContainerProps = {
  children: JSX.Element | JSX.Element[];
  links: BreadcrumbProps['links'];
  exitFullScreen(): void;
};

const StyledFullScreen = styled.div`
  display: flex;
  flex-direction: column;
  width: 100dvw;
  height: 100dvh;
  background: ${({ theme }) => theme.background.noisy};
`;

const StyledMainContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  height: calc(
    100% - ${PAGE_BAR_MIN_HEIGHT}px - ${({ theme }) => theme.spacing(2 * 2)}
  );
  width: 100%;
`;

export const FullScreenContainer = ({
  children,
  links,
  exitFullScreen,
}: FullScreenContainerProps) => {
  const isMobile = useIsMobile();
  const { t } = useLingui();

  const handleExitFullScreen = () => {
    exitFullScreen();
  };

  return (
    <StyledFullScreen>
      <PageHeader title={<Breadcrumb links={links} />}>
        <IconButton
          Icon={IconX}
          dataTestId="close-button"
          size={isMobile ? 'medium' : 'small'}
          variant="secondary"
          accent="default"
          onClick={handleExitFullScreen}
          ariaLabel={t`Exit Full Screen`}
        />
      </PageHeader>
      <StyledMainContainer>{children}</StyledMainContainer>
    </StyledFullScreen>
  );
};
