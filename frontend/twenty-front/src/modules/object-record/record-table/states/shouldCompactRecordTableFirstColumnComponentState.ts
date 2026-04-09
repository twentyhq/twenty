import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const shouldCompactRecordTableFirstColumnComponentState =
  createAtomComponentState<boolean>({
    key: 'shouldCompactRecordTableFirstColumnComponentState',
    defaultValue: false,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
