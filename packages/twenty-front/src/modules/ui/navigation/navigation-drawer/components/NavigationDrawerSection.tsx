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

  [data-nested-sections-fill-width] ${StyledSection} & {
    width: 100%;
  }
`;

export const NavigationDrawerSection = ({
  children,
  className,
  shouldNestedSectionsFillWidth = false,
}: {
  children: React.ReactNode;
  className?: string;
  shouldNestedSectionsFillWidth?: boolean;
}) => {
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  const isCollapsed = !isMobile && !isNavigationDrawerExpanded;

  return (
    <StyledSection
      className={className}
      data-nested-sections-fill-width={
        shouldNestedSectionsFillWidth || undefined
      }
    >
      <StyledSectionInnerContainerMinusScrollPadding
        isMobile={isMobile}
        isCollapsed={isCollapsed}
      >
        {children}
      </StyledSectionInnerContainerMinusScrollPadding>
    </StyledSection>
  );
};
