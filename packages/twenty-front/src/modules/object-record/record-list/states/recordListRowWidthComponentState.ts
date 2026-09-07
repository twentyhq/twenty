import { RecordListComponentInstanceContext } from '@/object-record/record-list/states/contexts/RecordListComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordListRowWidthComponentState =
  createAtomComponentState<number>({
    key: 'recordListRowWidthComponentState',
    defaultValue: Number.MAX_SAFE_INTEGER,
    componentInstanceContext: RecordListComponentInstanceContext,
  });
