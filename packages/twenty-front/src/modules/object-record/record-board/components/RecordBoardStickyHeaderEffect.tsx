import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useEffect } from 'react';

export const RecordBoardStickyHeaderEffect = () => {
  const scrollTop = useAtomComponentValue(scrollWrapperScrollTopComponentState);

  // TODO: move this outside because it might cause way too many re-renders for other hooks
  useEffect(() => {
    if (scrollTop > 0) {
      document
        .getElementById('record-board-header')
        ?.classList.add('header-sticky');
    } else {
      document
        .getElementById('record-board-header')
        ?.classList.remove('header-sticky');
    }
  }, [scrollTop]);

  return <></>;
};
