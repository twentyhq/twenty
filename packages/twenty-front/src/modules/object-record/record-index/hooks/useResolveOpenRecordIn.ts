import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { resolveOpenRecordIn } from '@/object-record/record-index/utils/resolveOpenRecordIn';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const useResolveOpenRecordIn = (objectNameSingular: string) => {
  const recordIndexOpenRecordIn = useAtomStateValue(
    recordIndexOpenRecordInState,
  );

  const isMobile = useIsMobile();

  return resolveOpenRecordIn({
    openRecordInViewSetting: recordIndexOpenRecordIn,
    objectNameSingular,
    canDisplaySidePanel: !isMobile,
  });
};
