import type { ReactNode } from 'react';
import { Collapsible } from 'twenty-ui/primitives/layout';

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
  isTitleHidden?: boolean;
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
  isTitleHidden = false,
  children,
  contentWrapper,
}: NavigationMenuItemSectionProps) => {
  const content = (
    <Collapsible.Root open={isOpen || forceExpanded || isTitleHidden}>
      <Collapsible.Panel dimension="height" containAnimation>
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  );

  return (
    <NavigationDrawerSection>
      {!isTitleHidden && (
        <NavigationDrawerAnimatedCollapseWrapper>
          <NavigationDrawerSectionTitle
            label={title}
            onClick={onToggle}
            rightIcon={rightIcon}
            alwaysShowRightIcon={alwaysShowRightIcon}
            isOpen={isOpen}
          />
        </NavigationDrawerAnimatedCollapseWrapper>
      )}
      {contentWrapper ? contentWrapper(content) : content}
    </NavigationDrawerSection>
  );
};
