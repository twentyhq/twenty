import {
  SCROLL_SPEED_THRESHOLD_IN_ROWS_PER_SECOND_TO_ACTIVATE_LOW_DETAILS,
  SCROLL_SPEED_THRESHOLD_IN_ROWS_PER_SECOND_TO_DEACTIVATE_LOW_DETAILS,
} from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedRowTreadmillEffect';
import { TABLE_VIRTUALIZATION_DEBUG_ACTIVATED } from '@/object-record/record-table/virtualization/constants/TableVirtualizationDebugActivated';
import { lowDetailsActivatedComponentState } from '@/object-record/record-table/virtualization/states/lowDetailsActivatedComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { createPortal } from 'react-dom';

export const RecordTableVirtualizedDebugHelper = () => {
  const lowDetailsActivated = useRecoilComponentValue(
    lowDetailsActivatedComponentState,
  );

  if (!TABLE_VIRTUALIZATION_DEBUG_ACTIVATED) {
    return;
  }

  return (
    <>
      {createPortal(
        <div
          id="table-virtualization-debug-helper"
          style={{
            zIndex: 1000,
            border: '1px solid red',
            backgroundColor: 'white',
            width: 800,
            height: 33,
            top: 8,
            left: 150,
            position: 'absolute',
          }}
        >
          <span>Virtualize debug helper</span>
          <span style={{ paddingLeft: 12 }}>
            - Low details activated : {lowDetailsActivated ? 'Yes' : 'No'}
          </span>
          <span style={{ paddingLeft: 12 }}>
            - Rows / sec threshold to activate low details :
            {SCROLL_SPEED_THRESHOLD_IN_ROWS_PER_SECOND_TO_ACTIVATE_LOW_DETAILS}
            and to deactivate :
            {
              SCROLL_SPEED_THRESHOLD_IN_ROWS_PER_SECOND_TO_DEACTIVATE_LOW_DETAILS
            }
          </span>
        </div>,
        document.body,
      )}
    </>
  );
};
