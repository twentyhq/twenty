import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { getRecordBoardHeaderHtmlId } from '@/object-record/record-board/utils/getRecordBoardHeaderHtmlId';
import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext, useEffect } from 'react';

export const RecordBoardStickyHeaderEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const scrollWrapperScrollTop = useAtomComponentStateValue(
    scrollWrapperScrollTopComponentState,
  );

  // TODO: move this outside because it might cause way too many re-renders for other hooks
  useEffect(() => {
    if (scrollWrapperScrollTop > 0) {
      document
        .getElementById(getRecordBoardHeaderHtmlId(recordBoardId))
        ?.classList.add('header-sticky');
    } else {
      document
        .getElementById(getRecordBoardHeaderHtmlId(recordBoardId))
        ?.classList.remove('header-sticky');
    }
  }, [scrollWrapperScrollTop, recordBoardId]);

  return <></>;
};
