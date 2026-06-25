import type { ReactNode } from 'react';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';

type NavigationMenuItemSectionProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  rightIcon?: ReactNode;
  alwaysShowRightIcon?: boolean;
  forceExpanded?: boolean;
  children: ReactNode;
  contentWrapper?: (children: ReactNode) => ReactNode;
};

export const NavigationMenuItemSection = ({
  title,
  isOpen,
  onToggle,
  rightIcon,
  alwaysShowRightIcon,
  forceExpanded = false,
  children,
  contentWrapper,
}: NavigationMenuItemSectionProps) => {
  const content = (
    <AnimatedExpandableContainer
      isExpanded={isOpen || forceExpanded}
      dimension="height"
      mode="fit-content"
      containAnimation
      initial={false}
    >
      {children}
    </AnimatedExpandableContainer>
  );

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={title}
          onClick={onToggle}
          rightIcon={rightIcon}
          alwaysShowRightIcon={alwaysShowRightIcon}
          isOpen={isOpen}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      {contentWrapper ? contentWrapper(content) : content}
    </NavigationDrawerSection>
  );
};
