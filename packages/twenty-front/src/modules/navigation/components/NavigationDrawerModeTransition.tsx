import { styled } from '@linaria/react';
import { type ReactNode, useRef } from 'react';

import { NavigationDrawerModeTransitionEffect } from '@/navigation/components/NavigationDrawerModeTransitionEffect';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: inherit;
  min-height: 0;
`;

type NavigationDrawerModeTransitionProps = {
  children: ReactNode;
};

export const NavigationDrawerModeTransition = ({
  children,
}: NavigationDrawerModeTransitionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <StyledContainer ref={containerRef}>
      <NavigationDrawerModeTransitionEffect containerRef={containerRef} />
      {children}
    </StyledContainer>
  );
};
