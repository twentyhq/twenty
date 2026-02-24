import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const isMultiDragActiveComponentState = createComponentState<boolean>({
  key: 'isMultiDragActiveComponentState',
  defaultValue: false,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
