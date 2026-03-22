import { styled } from '@linaria/react';
import { useState, type ReactNode } from 'react';
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

  return (
    <NavigationDrawerItemsCollapsableContainer isGroup={isGroup}>
      {header}
      <StyledFolderExpandableWrapper>
        <AnimatedExpandableContainer
          isExpanded={isOpen}
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
