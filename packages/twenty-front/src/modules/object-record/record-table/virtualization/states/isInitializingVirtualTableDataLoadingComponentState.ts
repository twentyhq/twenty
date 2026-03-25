import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const isInitializingVirtualTableDataLoadingComponentState =
  createAtomComponentState<boolean>({
    key: 'isInitializingVirtualTableDataLoadingComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: false,
  });
