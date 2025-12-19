import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { useRecoilValue } from 'recoil';

import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';

import { PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID } from '@/ui/layout/page/constants/PageActionContainerClickOutsideId';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/constants/PageBarMinHeight';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { AnimatePresence } from 'framer-motion';
import {
  type IconComponent,
  IconX,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledTopBarContainer = styled.div<{ isMobile: boolean }>`
  align-items: center;
  background: ${({ theme }) => theme.background.noisy};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.lg};
  justify-content: space-between;
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  padding-top: ${({ theme }) => theme.spacing(3)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  padding-left: ${({ isMobile, theme }) => (isMobile ? theme.spacing(3) : 0)};
  padding-right: ${({ theme }) => theme.spacing(3)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow-x: hidden;
  width: 100%;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledTitleContainer = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-right: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  overflow: hidden;
  align-items: center;
`;

const StyledTopBarIconStyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-direction: row;
  width: 100%;
  overflow: hidden;
`;

const StyledPageActionContainer = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(2)};
  flex: 1 0 auto;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

type PageHeaderProps = {
  title?: ReactNode;
  hasClosePageButton?: boolean;
  onClosePage?: () => void;
  Icon?: IconComponent;
  children?: ReactNode;
  className?: string;
};

export const PageHeader = ({
  title,
  hasClosePageButton,
  onClosePage,
  Icon,
  children,
  className,
}: PageHeaderProps) => {
  const isMobile = useIsMobile();
  const theme = useTheme();
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );

  return (
    <AnimatePresence initial={false}>
      <StyledTopBarContainer className={className} isMobile={isMobile}>
        <StyledLeftContainer>
          {!isMobile && !isNavigationDrawerExpanded && (
            <NavigationDrawerCollapseButton direction="right" />
          )}
          {hasClosePageButton && (
            <LightIconButton
              Icon={IconX}
              size="small"
              accent="tertiary"
              onClick={() => onClosePage?.()}
            />
          )}

          <StyledTopBarIconStyledTitleContainer>
            {Icon && (
              <StyledIconContainer>
                <Icon size={theme.icon.size.md} />
              </StyledIconContainer>
            )}
            {title && (
              <StyledTitleContainer data-testid="top-bar-title">
                {typeof title === 'string' ? (
                  <OverflowingTextWithTooltip text={title} />
                ) : (
                  title
                )}
              </StyledTitleContainer>
            )}
          </StyledTopBarIconStyledTitleContainer>
        </StyledLeftContainer>
        <StyledPageActionContainer
          data-click-outside-id={PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID}
        >
          {children}
        </StyledPageActionContainer>
      </StyledTopBarContainer>
    </AnimatePresence>
  );
};
