import React, { useContext } from 'react';
import { useInView } from 'react-intersection-observer';

import { ScrollWrapperContext } from '@/ui/utilities/scroll/components/ScrollWrapper';

type RenderIfVisibleProps = {
  children: React.ReactNode;
};

export const RenderIfVisible = ({ children }: RenderIfVisibleProps) => {
  const scrollWrapperRef = useContext(ScrollWrapperContext);

  const { ref: elementRef, inView } = useInView({
    root: scrollWrapperRef.current,
    rootMargin: '200px',
  });
  const placeholderStyle = { height: 30 };

  return React.createElement(
    'tbody',
    { ref: elementRef },
    inView ? children : React.createElement('tr', { style: placeholderStyle }),
  );
};
