import { useContext } from 'react';
import { useInView } from 'react-intersection-observer';

import { ObjectsTableWrapperContext } from '@/ui/utilities/objects-table/components/ObjectsTableWrapper';
import { ScrollWrapperContext } from '@/ui/utilities/scroll/components/ScrollWrapper';

export const ScrollLeftEdge = () => {
  const scrollWrapperRef = useContext(ScrollWrapperContext);
  const objectsTableWrapperRef = useContext(ObjectsTableWrapperContext);

  const { ref: elementRef } = useInView({
    root: scrollWrapperRef.current,
    onChange: (inView) => {
      objectsTableWrapperRef.current?.classList.toggle(
        'freeze-first-columns-shadow',
        !inView,
      );
    },
  });

  return <div ref={elementRef}></div>;
};
