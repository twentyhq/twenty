import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const dataPagesLoadedComponentState = createAtomComponentState<number[]>(
  {
    key: 'dataPagesLoadedComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: [],
  },
);
