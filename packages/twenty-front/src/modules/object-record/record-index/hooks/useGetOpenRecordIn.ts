import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { resolveOpenRecordIn } from '@/object-record/record-index/utils/resolveOpenRecordIn';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

export const useGetOpenRecordIn = () => {
  const store = useStore();

  const isMobile = useIsMobile();

  const getOpenRecordIn = useCallback(
    (objectNameSingular: string) =>
      resolveOpenRecordIn({
        openRecordInViewSetting: store.get(recordIndexOpenRecordInState.atom),
        objectNameSingular,
        canDisplaySidePanel: !isMobile,
      }),
    [isMobile, store],
  );

  return { getOpenRecordIn };
};
