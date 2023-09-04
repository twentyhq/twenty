import { createContext, RefObject, useRef } from 'react';
import styled from '@emotion/styled';

import { useListenScroll } from '../hooks/useListenScroll';

export const ScrollWrapperContext = createContext<RefObject<HTMLDivElement>>({
  current: null,
});

const StyledScrollWrapper = styled.div`
  display: flex;
  height: 100%;
  overflow: auto;
  scrollbar-gutter: stable;
  width: 100%;

  &.scrolling::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border.color.medium};
  }
`;

export type ScrollWrapperProps = {
  children: React.ReactNode;
  className?: string;
};

export function ScrollWrapper({ children, className }: ScrollWrapperProps) {
  const scrollableRef = useRef<HTMLDivElement>(null);

  useListenScroll({
    scrollableRef,
  });

  return (
    <ScrollWrapperContext.Provider value={scrollableRef}>
      <StyledScrollWrapper ref={scrollableRef} className={className}>
        {children}
      </StyledScrollWrapper>
    </ScrollWrapperContext.Provider>
  );
}
