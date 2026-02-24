import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const shouldCompactRecordTableFirstColumnComponentState =
  createComponentState<boolean>({
    key: 'shouldCompactRecordTableFirstColumnComponentState',
    defaultValue: false,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
