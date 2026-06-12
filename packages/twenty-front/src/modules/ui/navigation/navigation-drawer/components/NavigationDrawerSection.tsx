import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { useIsMobile } from 'twenty-ui-deprecated/utilities';

const StyledSection = styled.div`
  width: 100%;
`;

const StyledSectionInnerContainerMinusScrollPadding = styled.div<{
  isMobile: boolean;
  isMainNavCollapsed: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  width: ${({ isMobile, isMainNavCollapsed }) =>
    isMobile || isMainNavCollapsed
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
    <StyledSection className={className}>
      <StyledSectionInnerContainerMinusScrollPadding
        isMobile={isMobile}
        isMainNavCollapsed={isMainNavCollapsed}
      >
        {children}
      </StyledSectionInnerContainerMinusScrollPadding>
    </StyledSection>
  );
};
