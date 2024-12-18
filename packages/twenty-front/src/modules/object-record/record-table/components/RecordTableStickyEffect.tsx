import { useEffect } from 'react';

import { isRecordTableScrolledLeftComponentState } from '@/object-record/record-table/states/isRecordTableScrolledLeftComponentState';
import { useScrollLeftValue } from '@/ui/utilities/scroll/hooks/useScrollLeftValue';
import { useScrollTopValue } from '@/ui/utilities/scroll/hooks/useScrollTopValue';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const RecordTableStickyEffect = () => {
  const scrollTop = useScrollTopValue('recordTableWithWrappers');

  useEffect(() => {
    if (scrollTop > 0) {
      document
        .getElementById('record-table-header')
        ?.classList.add('header-sticky');
    } else {
      document
        .getElementById('record-table-header')
        ?.classList.remove('header-sticky');
    }
  }, [scrollTop]);

  const scrollLeft = useScrollLeftValue('recordTableWithWrappers');

  const setIsRecordTableScrolledLeft = useSetRecoilComponentStateV2(
    isRecordTableScrolledLeftComponentState,
  );

  useEffect(() => {
    setIsRecordTableScrolledLeft(scrollLeft === 0);
    if (scrollLeft > 0) {
      document
        .getElementById('record-table-body')
        ?.classList.add('first-columns-sticky');
      document
        .getElementById('record-table-header')
        ?.classList.add('first-columns-sticky');
      document
        .getElementById('record-table-footer')
        ?.classList.add('first-columns-sticky');
    } else {
      document
        .getElementById('record-table-body')
        ?.classList.remove('first-columns-sticky');
      document
        .getElementById('record-table-header')
        ?.classList.remove('first-columns-sticky');
      document
        .getElementById('record-table-footer')
        ?.classList.remove('first-columns-sticky');
    }
  }, [scrollLeft, setIsRecordTableScrolledLeft]);

  return <></>;
};
