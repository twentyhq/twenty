import { useEffect } from 'react';

import { useScrollTopValue } from '@/ui/utilities/scroll/hooks/useScrollTopValue';

export const RecordBoardStickyHeaderEffect = () => {
  const scrollTop = useScrollTopValue('recordBoard');

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
