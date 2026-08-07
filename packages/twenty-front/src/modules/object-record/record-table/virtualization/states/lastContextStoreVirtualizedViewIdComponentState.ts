import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Bound per record table: the context store instance is global, so storing the
// last view there made every navigation look like a view change
export const lastContextStoreVirtualizedViewIdComponentState =
  createAtomComponentState<string | null>({
    key: 'lastContextStoreVirtualizedViewIdComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
