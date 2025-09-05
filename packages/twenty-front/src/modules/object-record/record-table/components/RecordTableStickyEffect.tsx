import { useEffect } from 'react';

import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { scrollWrapperScrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState';
import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

export const RecordTableStickyEffect = () => {
  const scrollTop = useRecoilComponentValue(
    scrollWrapperScrollTopComponentState,
  );

  const setIsRecordTableScrolledVertically = useSetRecoilComponentState(
    isRecordTableScrolledVerticallyComponentState,
  );

  useEffect(() => {
    setIsRecordTableScrolledVertically(scrollTop > 0);

    if (scrollTop > 0) {
      document
        .getElementById('record-table-header')
        ?.classList.add('header-sticky');
    } else {
      document
        .getElementById('record-table-header')
        ?.classList.remove('header-sticky');
    }
  }, [scrollTop, setIsRecordTableScrolledVertically]);

  const scrollLeft = useRecoilComponentValue(
    scrollWrapperScrollLeftComponentState,
  );

  const setIsRecordTableScrolledHorizontally = useSetRecoilComponentState(
    isRecordTableScrolledHorizontallyComponentState,
  );

  useEffect(() => {
    setIsRecordTableScrolledHorizontally(scrollLeft > 0);

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
  }, [scrollLeft, setIsRecordTableScrolledHorizontally]);

  return <></>;
};
