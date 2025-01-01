import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';

export type PendingRecordState = {
  recordId: string | null;
  position: 'first' | 'last' | undefined;
};

export const recordBoardPendingRecordIdByColumnComponentFamilyState =
  createComponentFamilyStateV2<PendingRecordState, string>({
    key: 'recordBoardPendingRecordIdByColumnComponentFamilyState',
    defaultValue: {
      recordId: null,
      position: 'last',
    },
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
