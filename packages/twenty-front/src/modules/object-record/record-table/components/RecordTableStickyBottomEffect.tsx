import { useEffect } from 'react';

import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordTableStickyBottomEffect = () => {
  const scrollBottom = useRecoilComponentValue(
    scrollWrapperScrollBottomComponentState,
  );

  useEffect(() => {
    if (scrollBottom > 1) {
      document
        .getElementById('record-table-body')
        ?.classList.add('footer-sticky');
      document
        .getElementById('record-table-footer')
        ?.classList.add('footer-sticky');
    } else {
      document
        .getElementById('record-table-body')
        ?.classList.remove('footer-sticky');
      document
        .getElementById('record-table-footer')
        ?.classList.remove('footer-sticky');
    }
  }, [scrollBottom]);

  return <></>;
};
