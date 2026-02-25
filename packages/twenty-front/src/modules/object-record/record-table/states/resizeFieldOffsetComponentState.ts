import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const resizeFieldOffsetComponentState = createAtomComponentState<number>(
  {
    key: 'resizeFieldOffsetComponentState',
    defaultValue: 0,
    componentInstanceContext: RecordTableComponentInstanceContext,
  },
);
