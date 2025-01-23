import { useEffect } from 'react';

import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrappeScrollBottomComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTableStickyBottomEffect = () => {
  const scrollBottom = useRecoilComponentValueV2(
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
