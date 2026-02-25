import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const totalNumberOfRecordsToVirtualizeComponentState =
  createAtomComponentState<number | null>({
    key: 'totalNumberOfRecordsToVirtualizeComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
