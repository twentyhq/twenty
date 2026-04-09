import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const isDraggingRecordComponentState = createAtomComponentState<boolean>(
  {
    key: 'isDraggingRecordComponentState',
    defaultValue: false,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  },
);
