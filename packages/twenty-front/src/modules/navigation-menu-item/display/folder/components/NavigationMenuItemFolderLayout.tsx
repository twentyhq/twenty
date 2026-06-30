import { styled } from '@linaria/react';
import { useDeferredValue, useState, type ReactNode } from 'react';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';

const StyledFolderExpandableWrapper = styled.div`
  & > div {
    overflow: visible !important;
  }
`;

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
  const [skipInitialExpandAnimation] = useState(() => isOpen);

  const deferredIsOpen = useDeferredValue(isOpen);
  const isExpandedForAnimation = isOpen ? deferredIsOpen : false;

  return (
    <NavigationDrawerItemsCollapsableContainer isGroup={isGroup}>
      {header}
      <StyledFolderExpandableWrapper>
        <AnimatedExpandableContainer
          isExpanded={isExpandedForAnimation}
          dimension="height"
          mode="fit-content"
          containAnimation
          initial={!skipInitialExpandAnimation}
        >
          {children}
        </AnimatedExpandableContainer>
      </StyledFolderExpandableWrapper>
    </NavigationDrawerItemsCollapsableContainer>
  );
};
