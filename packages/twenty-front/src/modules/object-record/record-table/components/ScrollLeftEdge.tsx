import { useContext, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSetRecoilState } from 'recoil';

import { isTabelScrolledState } from '@/object-record/record-table/states/isTableScrolledState';
import { ScrollWrapperContext } from '@/ui/utilities/scroll/components/ScrollWrapper';

export const ScrollLeftEdge = () => {
  const scrollWrapperRef = useContext(ScrollWrapperContext);
  const setIsTableScrolledState = useSetRecoilState(isTabelScrolledState);

  const { ref: elementRef, inView } = useInView({
    root: scrollWrapperRef.current,
  });

  useEffect(() => {
    setIsTableScrolledState(!inView);
  }, [inView]);

  return <div ref={elementRef}></div>;
};
