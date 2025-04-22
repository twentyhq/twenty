import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { useRecoilValue } from 'recoil';

import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';

import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import {
  IconComponent,
  IconX,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

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
  gap: ${({ theme }) => theme.spacing(2)};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
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
  margin-left: ${({ theme }) => theme.spacing(0.5)};
  margin-right: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  overflow: hidden;
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

const StyledTopBarButtonContainer = styled.div`
  margin-left: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(1)};
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
    <StyledTopBarContainer className={className}>
      <StyledLeftContainer>
        {!isMobile && !isNavigationDrawerExpanded && (
          <StyledTopBarButtonContainer>
            <NavigationDrawerCollapseButton direction="right" />
          </StyledTopBarButtonContainer>
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

      <StyledPageActionContainer className="page-action-container">
        {children}
      </StyledPageActionContainer>
    </StyledTopBarContainer>
  );
};
