import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledSection = styled.div`
  width: 100%;
`;

const StyledSectionInnerContainerMinusScrollPadding = styled.div<{
  isMobile: boolean;
  isCollapsed: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  width: ${({ isMobile, isCollapsed }) =>
    isMobile || isCollapsed
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
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  const isCollapsed = !isMobile && !isNavigationDrawerExpanded;

  return (
    <StyledSection className={className}>
      <StyledSectionInnerContainerMinusScrollPadding
        isMobile={isMobile}
        isCollapsed={isCollapsed}
      >
        {children}
      </StyledSectionInnerContainerMinusScrollPadding>
    </StyledSection>
  );
};
