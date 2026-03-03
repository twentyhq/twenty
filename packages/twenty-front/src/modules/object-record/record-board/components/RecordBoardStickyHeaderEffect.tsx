import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useEffect } from 'react';

export const RecordBoardStickyHeaderEffect = () => {
  const scrollWrapperScrollTop = useAtomComponentStateValue(
    scrollWrapperScrollTopComponentState,
  );

  // TODO: move this outside because it might cause way too many re-renders for other hooks
  useEffect(() => {
    if (scrollWrapperScrollTop > 0) {
      document
        .getElementById('record-board-header')
        ?.classList.add('header-sticky');
    } else {
      document
        .getElementById('record-board-header')
        ?.classList.remove('header-sticky');
    }
  }, [scrollWrapperScrollTop]);

  return <></>;
};
