import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordTableDataGenerationComponentState =
  createAtomComponentState<number>({
    key: 'recordTableDataGenerationComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: 0,
  });
