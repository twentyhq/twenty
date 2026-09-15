import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { AnimatedExpandableContainer } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
`;

type CollapsibleNavigationDrawerSectionProps = {
  // Namespaced id (e.g. 'settings/User') used to persist open/closed state.
  sectionId: string;
  label: string;
  children: ReactNode;
  wrapTitle?: (titleNode: ReactNode) => ReactNode;
};

export const CollapsibleNavigationDrawerSection = ({
  sectionId,
  label,
  children,
  wrapTitle,
}: CollapsibleNavigationDrawerSectionProps) => {
  const isNavigationDrawerExpanded = useIsNavigationDrawerContentExpanded();
  const { toggleNavigationSection, isNavigationSectionOpen } =
    useNavigationSection(sectionId);

  const titleNode = (
    <NavigationDrawerSectionTitle
      label={label}
      onClick={toggleNavigationSection}
      isOpen={isNavigationSectionOpen}
    />
  );

  return (
    <NavigationDrawerSection>
      {isNavigationDrawerExpanded &&
        (wrapTitle ? wrapTitle(titleNode) : titleNode)}
      <AnimatedExpandableContainer
        isExpanded={!isNavigationDrawerExpanded || isNavigationSectionOpen}
        dimension="height"
        mode="fit-content"
        containAnimation
        initial={false}
      >
        <StyledItems>{children}</StyledItems>
      </AnimatedExpandableContainer>
    </NavigationDrawerSection>
  );
};
