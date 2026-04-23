import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledSection = styled.div<{ isSettingsDrawer?: boolean }>`
  margin-bottom: ${({ isSettingsDrawer }) =>
    isSettingsDrawer ? themeCssVariables.spacing[3] : '0'};
  width: 100%;
`;

const StyledSectionInnerContainerMinusScrollPadding = styled.div<{
  isMobile: boolean;
  isSettingsDrawer: boolean;
  isMainNavCollapsed: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  width: ${({ isMobile, isSettingsDrawer, isMainNavCollapsed }) =>
    isMobile || isSettingsDrawer || isMainNavCollapsed
      ? '100%'
      : `calc(100% - ${themeCssVariables.spacing[2]})`};
`;

export const NavigationDrawerSection = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  const isMainNavCollapsed =
    !isSettingsDrawer && !isMobile && !isNavigationDrawerExpanded;

  return (
    <StyledSection isSettingsDrawer={isSettingsDrawer} className={className}>
      <StyledSectionInnerContainerMinusScrollPadding
        isMobile={isMobile}
        isSettingsDrawer={isSettingsDrawer}
        isMainNavCollapsed={isMainNavCollapsed}
      >
        {children}
      </StyledSectionInnerContainerMinusScrollPadding>
    </StyledSection>
  );
};
