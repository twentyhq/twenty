import { ReactNode } from 'react';
import { AnimatedExpandableContainer } from 'twenty-ui';

type NavigationDrawerSubItemAnimatedExpandableContainerProps = {
  children: ReactNode;
  isOpen?: boolean;
};

export const NavigationDrawerSubItemAnimatedExpandableContainer = ({
  children,
  isOpen = false,
}: NavigationDrawerSubItemAnimatedExpandableContainerProps) => {
  return (
    <AnimatedExpandableContainer
      isExpanded={isOpen}
      dimension="height"
      mode="fit-content"
      useThemeAnimation
    >
      {children}
    </AnimatedExpandableContainer>
  );
};
