import { ComponentProps, ReactNode } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconChevronLeft } from 'twenty-ui';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { OverflowingTextWithTooltip } from '@/ui/display/tooltip/OverflowingTextWithTooltip';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';
import { isNavigationDrawerOpenState } from '@/ui/navigation/states/isNavigationDrawerOpenState';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/MobileViewport';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const PAGE_BAR_MIN_HEIGHT = 40;

const StyledTopBarContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.noisy};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.lg};
  justify-content: space-between;
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  padding: ${({ theme }) => theme.spacing(2)};
  padding-left: 0;
  padding-right: ${({ theme }) => theme.spacing(3)};
  z-index: 20;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${({ theme }) => theme.spacing(3)};
  }
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledTitleContainer = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  margin-left: ${({ theme }) => theme.spacing(1)};
  max-width: 50%;
`;

const StyledTopBarIconStyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  flex-direction: row;
`;

const StyledPageActionContainer = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTopBarButtonContainer = styled.div`
  margin-left: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.quaternary}
      highlightColor={theme.background.transparent.light}
      borderRadius={50}
    >
      <Skeleton height={24} width={108} />
    </SkeletonTheme>
  );
};

type PageHeaderProps = ComponentProps<'div'> & {
  title: string;
  hasBackButton?: boolean;
  Icon: IconComponent;
  children?: ReactNode;
  loading?: boolean;
};

export const PageHeader = ({
  title,
  hasBackButton,
  Icon,
  children,
  loading,
}: PageHeaderProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const theme = useTheme();
  const isNavigationDrawerOpen = useRecoilValue(isNavigationDrawerOpenState);

  return (
    <StyledTopBarContainer>
      <StyledLeftContainer>
        {!isMobile && !isNavigationDrawerOpen && (
          <StyledTopBarButtonContainer>
            <NavigationDrawerCollapseButton direction="right" />
          </StyledTopBarButtonContainer>
        )}
        {hasBackButton && (
          <IconButton
            Icon={IconChevronLeft}
            size="small"
            onClick={() => navigate(-1)}
            variant="tertiary"
          />
        )}
        {loading ? (
          <StyledSkeletonLoader />
        ) : (
          <StyledTopBarIconStyledTitleContainer>
            {Icon && <Icon size={theme.icon.size.md} />}
            <StyledTitleContainer data-testid="top-bar-title">
              <OverflowingTextWithTooltip text={title} />
            </StyledTitleContainer>
          </StyledTopBarIconStyledTitleContainer>
        )}
      </StyledLeftContainer>
      <StyledPageActionContainer>{children}</StyledPageActionContainer>
    </StyledTopBarContainer>
  );
};
