import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { type ReactNode } from 'react';
import { AnimatedExpandableContainer } from 'twenty-ui-deprecated/layout';

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
      {wrapTitle ? wrapTitle(titleNode) : titleNode}
      <AnimatedExpandableContainer
        isExpanded={isNavigationSectionOpen}
        dimension="height"
        mode="fit-content"
        containAnimation
        initial={false}
      >
        {children}
      </AnimatedExpandableContainer>
    </NavigationDrawerSection>
  );
};
