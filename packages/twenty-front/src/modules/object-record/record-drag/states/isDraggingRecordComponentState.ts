import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isDraggingRecordComponentState = createComponentState<boolean>({
  key: 'isDraggingRecordComponentState',
  defaultValue: false,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
