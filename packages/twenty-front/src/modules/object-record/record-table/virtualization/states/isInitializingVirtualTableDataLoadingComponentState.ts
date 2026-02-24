import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const isInitializingVirtualTableDataLoadingComponentState =
  createComponentStateV2<boolean>({
    key: 'isInitializingVirtualTableDataLoadingComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: false,
  });
