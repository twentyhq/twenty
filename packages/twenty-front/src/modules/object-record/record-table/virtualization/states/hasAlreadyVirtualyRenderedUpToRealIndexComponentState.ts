import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const hasAlreadyVirtualyRenderedUpToRealIndexComponentState =
  createComponentState<number | null>({
    key: 'hasAlreadyVirtualyRenderedUpToRealIndexComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
