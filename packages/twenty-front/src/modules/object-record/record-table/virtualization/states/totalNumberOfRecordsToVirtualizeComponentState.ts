import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const totalNumberOfRecordsToVirtualizeComponentState =
  createComponentState<number | null>({
    key: 'totalNumberOfRecordsToVirtualizeComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
