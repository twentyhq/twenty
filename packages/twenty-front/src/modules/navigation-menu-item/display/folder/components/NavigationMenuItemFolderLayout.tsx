import { useDeferredValue, type ReactNode } from 'react';
import { Collapsible } from 'twenty-ui/primitives/layout';

import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';

type NavigationMenuItemFolderLayoutProps = {
  header: ReactNode;
  isOpen: boolean;
  isGroup: boolean;
  children: ReactNode;
};

export const NavigationMenuItemFolderLayout = ({
  header,
  isOpen,
  isGroup,
  children,
}: NavigationMenuItemFolderLayoutProps) => {
  const deferredIsOpen = useDeferredValue(isOpen);
  const isExpandedForAnimation = isOpen ? deferredIsOpen : false;

  return (
    <NavigationDrawerItemsCollapsableContainer isGroup={isGroup}>
      {header}
      <Collapsible.Root open={isExpandedForAnimation}>
        <Collapsible.Panel dimension="height" containAnimation>
          {children}
        </Collapsible.Panel>
      </Collapsible.Root>
    </NavigationDrawerItemsCollapsableContainer>
  );
};
