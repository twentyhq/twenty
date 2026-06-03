import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';

import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';

import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID } from '@/ui/layout/page/constants/PageActionContainerClickOutsideId';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/constants/PageBarMinHeight';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { AnimatePresence } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconX,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import {
  MOBILE_VIEWPORT,
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
import { useIsRtl } from '~/utils/i18n/useIsRtl';

const StyledTopBarContainer = styled.div<{ isMobile: boolean }>`
  align-items: center;
  background: ${themeCssVariables.background.noisy};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.lg};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  padding-block: ${themeCssVariables.spacing[3]};
  padding-inline-end: ${themeCssVariables.spacing[3]};
  padding-inline-start: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[3] : themeCssVariables.spacing[4]};
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 0 1 auto;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow-x: hidden;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-inline-start: ${themeCssVariables.spacing[1]};
  }
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-inline-end: ${themeCssVariables.spacing[1]};
  overflow: hidden;
  width: 100%;
`;

const StyledTopBarIconStyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
  width: 100%;
`;

const StyledPageActionContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 0;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};

  justify-content: flex-end;
  min-width: 0;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-basis: 100%;
    justify-content: flex-start;
  }
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
  const isSettingsPage = useIsSettingsPage();
  const { theme } = useContext(ThemeContext);
  const isNavigationDrawerExpanded = useNavigationDrawerExpanded();
  const isRtl = useIsRtl();

  return (
    <AnimatePresence initial={false}>
      <StyledTopBarContainer className={className} isMobile={isMobile}>
        <StyledLeftContainer>
          {!isNavigationDrawerExpanded && (!isMobile || isSettingsPage) && (
            <NavigationDrawerCollapseButton
              direction={isRtl ? 'right' : 'left'}
            />
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
            {isDefined(title) && (
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
