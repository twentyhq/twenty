import React from 'react';
import { useInView } from 'react-intersection-observer';

export const IntersectionObserverWrapper = ({
  set,
  id,
  rootRef,
  children,
  margin,
}: {
  set: React.Dispatch<React.SetStateAction<Set<string>>>;
  id: string;
  rootRef?: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  margin?: string;
}) => {
  const { ref, inView } = useInView({
    threshold: 1,
    onChange: (inView) => {
      if (inView) {
        set((prev: Set<string>) => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
        });
      }
      if (!inView) {
        set((prev: Set<string>) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    },
    root: rootRef?.current,
    rootMargin: margin,
  });

  return (
    <div ref={ref}>
      {React.cloneElement(children as React.ReactElement, { inView })}
    </div>
  );
};
