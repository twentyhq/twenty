import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const hasAlreadyFetchedUpToRealIndexComponentState =
  createComponentState<number | null>({
    key: 'hasAlreadyFetchedUpToRealIndexComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
