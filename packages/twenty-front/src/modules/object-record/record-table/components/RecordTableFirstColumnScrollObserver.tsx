import { useContext, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { scrollLeftState } from '@/ui/utilities/scroll/states/scrollLeftState';

export const RecordTableFirstColumnScrollEffect = () => {
  const { recordTableRef } = useContext(RecordTableContext);

  const scrollLeft = useRecoilValue(scrollLeftState);

  useEffect(() => {
    recordTableRef.current?.classList.toggle(
      'freeze-first-columns-shadow',
      scrollLeft > 0,
    );
  }, [scrollLeft, recordTableRef]);

  return <></>;
};
