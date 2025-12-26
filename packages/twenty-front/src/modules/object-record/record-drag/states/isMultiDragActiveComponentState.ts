import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isMultiDragActiveComponentState = createComponentState<boolean>({
  key: 'isMultiDragActiveComponentState',
  defaultValue: false,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
