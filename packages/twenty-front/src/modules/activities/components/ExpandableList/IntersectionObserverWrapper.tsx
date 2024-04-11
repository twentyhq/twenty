import React from 'react';
import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';

const StyledDiv = styled.div<{ inView?: boolean }>`
  opacity: ${({ inView }) => (inView === undefined || inView ? 1 : 0)};
`;

export const IntersectionObserverWrapper = ({
  set,
  id,
  rootRef,
  children,
}: {
  set: React.Dispatch<React.SetStateAction<Set<number>>>;
  id: number;
  rootRef?: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}) => {
  const { ref, inView } = useInView({
    threshold: 1,
    onChange: (inView) => {
      if (inView) {
        set((prev: Set<number>) => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
        });
      }
      if (!inView) {
        set((prev: Set<number>) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    },
    root: rootRef?.current,
    rootMargin: '0px 0px -50px 0px',
  });

  return (
    <StyledDiv ref={ref} inView={inView}>
      {children}
    </StyledDiv>
  );
};
