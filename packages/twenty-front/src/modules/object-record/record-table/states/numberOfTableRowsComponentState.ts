import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const numberOfTableRowsComponentState = createAtomComponentState<number>(
  {
    key: 'numberOfTableRowsComponentState',
    defaultValue: 0,
    componentInstanceContext: RecordTableComponentInstanceContext,
  },
);
