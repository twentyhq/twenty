import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const shouldCompactRecordTableFirstColumnComponentState =
  createComponentState<boolean>({
    key: 'shouldCompactRecordTableFirstColumnComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: false,
  });
