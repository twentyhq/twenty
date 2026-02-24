import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const isDraggingRecordComponentState = createComponentStateV2<boolean>({
  key: 'isDraggingRecordComponentState',
  defaultValue: false,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
