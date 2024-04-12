import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';

const StyledDiv = styled.div<{ inView?: boolean }>`
  border: 1px solid black;
  display: ${({ inView }) =>
    inView === undefined || inView ? 'block' : 'none'};
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
  const [isViewCustom, setIsViewCustom] = useState(true);
  const { ref } = useInView({
    threshold: 1,
    onChange: (inView, entry) => {
      console.log('entry', id, inView, entry.intersectionRatio);
      if (inView || (!inView && entry.intersectionRatio > 0.2)) {
        setIsViewCustom(true);
        set((prev: Set<any>) => {
          const newSet = new Set(prev);
          newSet.add({ id, ref });
          return newSet;
        });
      } else {
        setIsViewCustom(false);
        set((prev: Set<any>) => {
          const newSet = new Set(prev);
          newSet.delete({ id, ref });
          return newSet;
        });
      }
    },
    root: rootRef?.current,
    rootMargin: '0px 0px -50px 0px',
  });

  console.log(`${id} -- ${isViewCustom} `);
  return (
    <>{children}</>
    /*<StyledDiv ref={ref} inView={isViewCustom}>
      {children}
    </StyledDiv>*/
  );
};
