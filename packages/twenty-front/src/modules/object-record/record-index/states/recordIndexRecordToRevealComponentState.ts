import { type RecordIndexRecordToReveal } from '@/object-record/record-index/types/RecordIndexRecordToReveal';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexRecordToRevealComponentState =
  createAtomComponentState<RecordIndexRecordToReveal | null>({
    key: 'recordIndexRecordToRevealComponentState',
    defaultValue: null,
    componentInstanceContext: ViewComponentInstanceContext,
  });
