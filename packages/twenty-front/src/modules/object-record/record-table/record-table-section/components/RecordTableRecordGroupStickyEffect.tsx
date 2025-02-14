import { useEffect } from 'react';

import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { isRecordTableScrolledLeftComponentState } from '@/object-record/record-table/states/isRecordTableScrolledLeftComponentState';
import { scrollWrapperScrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const RecordTableRecordGroupStickyEffect = () => {
  const scrollLeft = useRecoilComponentValueV2(
    scrollWrapperScrollLeftComponentState,
  );

  const setIsRecordTableScrolledLeft = useSetRecoilComponentStateV2(
    isRecordTableScrolledLeftComponentState,
  );

  const currentRecordGroupId = useCurrentRecordGroupId();

  useEffect(() => {
    setIsRecordTableScrolledLeft(scrollLeft === 0);
    if (scrollLeft > 0) {
      document
        .getElementById(
          `record-table-footer${currentRecordGroupId ? '-' + currentRecordGroupId : ''}`,
        )
        ?.classList.add('first-columns-sticky');
      document
        .getElementById(
          `record-table-body${currentRecordGroupId ? '-' + currentRecordGroupId : ''}`,
        )
        ?.classList.add('first-columns-sticky');
    } else {
      document
        .getElementById(
          `record-table-footer${currentRecordGroupId ? '-' + currentRecordGroupId : ''}`,
        )
        ?.classList.remove('first-columns-sticky');
      document
        .getElementById(
          `record-table-body${currentRecordGroupId ? '-' + currentRecordGroupId : ''}`,
        )
        ?.classList.remove('first-columns-sticky');
    }
  }, [currentRecordGroupId, scrollLeft, setIsRecordTableScrolledLeft]);

  return <></>;
};
