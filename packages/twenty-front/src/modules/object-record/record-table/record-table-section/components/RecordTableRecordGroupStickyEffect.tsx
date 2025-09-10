import { useEffect } from 'react';

import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { scrollWrapperScrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

export const RecordTableRecordGroupStickyEffect = () => {
  const scrollLeft = useRecoilComponentValue(
    scrollWrapperScrollLeftComponentState,
  );

  const setIsRecordTableScrolledHorizontally = useSetRecoilComponentState(
    isRecordTableScrolledHorizontallyComponentState,
  );

  const currentRecordGroupId = useCurrentRecordGroupId();

  useEffect(() => {
    setIsRecordTableScrolledHorizontally(scrollLeft > 0);
    // TODO: see if we need to reimplement setting classes here.
  }, [currentRecordGroupId, scrollLeft, setIsRecordTableScrolledHorizontally]);

  return <></>;
};
