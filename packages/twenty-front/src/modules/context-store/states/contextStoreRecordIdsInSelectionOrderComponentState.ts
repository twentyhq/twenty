import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// The targeted records rule lists selected records in view order; this keeps
// the order they were selected in.
export const contextStoreRecordIdsInSelectionOrderComponentState =
  createAtomComponentState<string[]>({
    key: 'contextStoreRecordIdsInSelectionOrderComponentState',
    defaultValue: [],
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
