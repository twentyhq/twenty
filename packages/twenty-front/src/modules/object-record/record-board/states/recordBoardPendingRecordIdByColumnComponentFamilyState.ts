import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';

export type PendingRecordState = {
  recordId: string | null;
  isOpportunity: boolean;
  position: 'first' | 'last' | undefined;
  company: RecordForSelect | null;
};

export const recordBoardPendingRecordIdByColumnComponentFamilyState =
  createComponentFamilyStateV2<PendingRecordState, string>({
    key: 'recordBoardPendingRecordIdByColumnComponentFamilyState',
    defaultValue: {
      recordId: null,
      isOpportunity: false,
      position: 'last',
      company: null,
    },
    componentInstanceContext: RecordBoardComponentInstanceContext,
  });
