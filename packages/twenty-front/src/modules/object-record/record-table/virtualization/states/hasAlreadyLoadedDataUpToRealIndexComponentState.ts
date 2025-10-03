import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const hasAlreadyLoadedDataUpToRealIndexComponentState =
  createComponentState<number | null>({
    key: 'hasAlreadyLoadedDataUpToRealIndexComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
