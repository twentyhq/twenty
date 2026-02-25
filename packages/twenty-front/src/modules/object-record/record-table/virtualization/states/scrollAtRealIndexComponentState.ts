import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const scrollAtRealIndexComponentState = createAtomComponentState<number>(
  {
    key: 'scrollAtRealIndexComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: 0,
  },
);
