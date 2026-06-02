import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { type ReactNode } from 'react';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

type CollapsibleNavigationDrawerSectionProps = {
  // Unique id used to persist the open/closed state in localStorage. Pass
  // a namespaced value (e.g. 'settings/User') so unrelated sections in
  // different drawers don't share state.
  sectionId: string;
  label: string;
  children: ReactNode;
  // Optional wrapper around the section title (e.g. AdvancedSettingsWrapper
  // for advanced-mode-only sections). Receives the title node and returns
  // the wrapped node.
  wrapTitle?: (titleNode: ReactNode) => ReactNode;
};

// One-stop section component for any drawer that wants the main-app's
// collapsible section behavior: click the title to collapse / expand,
// animated height transition, persisted open state, chevron-on-hover.
// Use this instead of stitching together NavigationDrawerSection +
// NavigationDrawerSectionTitle + AnimatedExpandableContainer by hand at
// every call site.
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
