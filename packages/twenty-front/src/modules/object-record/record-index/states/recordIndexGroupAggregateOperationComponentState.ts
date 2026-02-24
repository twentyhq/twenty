import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const recordIndexGroupAggregateOperationComponentState =
  createComponentState<ExtendedAggregateOperations | null>({
    key: 'recordIndexGroupAggregateOperationComponentState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
