import { type ReactNode, useContext } from 'react';
import { Collapsible } from 'twenty-ui/primitives/layout';

import { SortableDropTargetRefContext } from '@/navigation-menu-item/common/contexts/SortableDropTargetRefContext';
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
  const setSortableDropTargetRef = useContext(SortableDropTargetRefContext);
  const content = (
    <Collapsible.Root open={isOpen || forceExpanded}>
      <Collapsible.Panel dimension="height" containAnimation>
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  );

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <div ref={setSortableDropTargetRef ?? undefined}>
          <NavigationDrawerSectionTitle
            label={title}
            onClick={onToggle}
            rightIcon={rightIcon}
            alwaysShowRightIcon={alwaysShowRightIcon}
            isOpen={isOpen}
          />
        </div>
      </NavigationDrawerAnimatedCollapseWrapper>
      {contentWrapper ? contentWrapper(content) : content}
    </NavigationDrawerSection>
  );
};
