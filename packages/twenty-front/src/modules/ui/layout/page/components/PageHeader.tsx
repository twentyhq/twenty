import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { useRecoilValue } from 'recoil';
import {
  IconChevronDown,
  IconChevronUp,
  IconComponent,
  IconX,
  MOBILE_VIEWPORT,
  OverflowingTextWithTooltip,
} from 'twenty-ui';

import { IconButton } from '@/ui/input/button/components/IconButton';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';

import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const PAGE_BAR_MIN_HEIGHT = 40;

const StyledTopBarContainer = styled.div<{ width?: number }>`
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
  width: ${({ width }) => width + 'px' || '100%'};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
    box-sizing: border-box;
    padding: ${({ theme }) => theme.spacing(3)};
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
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledTopBarIconStyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-direction: row;
  width: 100%;
`;

const StyledPageActionContainer = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTopBarButtonContainer = styled.div`
  margin-left: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

type PageHeaderProps = {
  title: ReactNode;
  hasClosePageButton?: boolean;
  onClosePage?: () => void;
  hasPaginationButtons?: boolean;
  hasPreviousRecord?: boolean;
  hasNextRecord?: boolean;
  navigateToPreviousRecord?: () => void;
  navigateToNextRecord?: () => void;
  Icon?: IconComponent;
  children?: ReactNode;
  width?: number;
};

export const PageHeader = ({
  title,
  hasClosePageButton,
  onClosePage,
  hasPaginationButtons,
  hasPreviousRecord,
  hasNextRecord,
  navigateToPreviousRecord,
  navigateToNextRecord,
  Icon,
  children,
  width,
}: PageHeaderProps) => {
  const isMobile = useIsMobile();
  const theme = useTheme();
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );

  return (
    <StyledTopBarContainer width={width}>
      <StyledLeftContainer>
        {!isMobile && !isNavigationDrawerExpanded && (
          <StyledTopBarButtonContainer>
            <NavigationDrawerCollapseButton direction="right" />
          </StyledTopBarButtonContainer>
        )}
        {hasClosePageButton && (
          <IconButton
            Icon={IconX}
            size="small"
            variant="tertiary"
            onClick={() => onClosePage?.()}
          />
        )}

        <StyledTopBarIconStyledTitleContainer>
          {hasPaginationButtons && (
            <>
              <IconButton
                Icon={IconChevronUp}
                size="small"
                variant="secondary"
                disabled={!hasPreviousRecord}
                onClick={() => navigateToPreviousRecord?.()}
              />
              <IconButton
                Icon={IconChevronDown}
                size="small"
                variant="secondary"
                disabled={!hasNextRecord}
                onClick={() => navigateToNextRecord?.()}
              />
            </>
          )}
          {Icon && <Icon size={theme.icon.size.md} />}
          <StyledTitleContainer data-testid="top-bar-title">
            {typeof title === 'string' ? (
              <OverflowingTextWithTooltip text={title} />
            ) : (
              title
            )}
          </StyledTitleContainer>
        </StyledTopBarIconStyledTitleContainer>
      </StyledLeftContainer>
      <StyledPageActionContainer>{children}</StyledPageActionContainer>
    </StyledTopBarContainer>
  );
};
