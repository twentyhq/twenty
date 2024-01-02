import { useContext } from 'react';
import { useInView } from 'react-intersection-observer';

import { RecordTableRefContext } from '@/object-record/record-table/contexts/RecordTableRefContext';
import { ScrollWrapperContext } from '@/ui/utilities/scroll/components/ScrollWrapper';

export const RecordTableFirstColumnScrollObserver = () => {
  const scrollWrapperRef = useContext(ScrollWrapperContext);
  const recordTableRef = useContext(RecordTableRefContext);

  const { ref: elementRef } = useInView({
    root: scrollWrapperRef.current,
    onChange: (inView) => {
      recordTableRef.current?.classList.toggle(
        'freeze-first-columns-shadow',
        !inView,
      );
    },
  });

  return <div ref={elementRef}></div>;
};
