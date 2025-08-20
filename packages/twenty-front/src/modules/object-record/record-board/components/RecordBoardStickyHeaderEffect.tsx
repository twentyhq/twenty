import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useEffect } from 'react';

export const RecordBoardStickyHeaderEffect = () => {
  const scrollTop = useRecoilComponentValue(
    scrollWrapperScrollTopComponentState,
  );

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
