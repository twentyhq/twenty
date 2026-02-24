import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const isInitializingVirtualTableDataLoadingComponentState =
  createComponentState<boolean>({
    key: 'isInitializingVirtualTableDataLoadingComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: false,
  });
