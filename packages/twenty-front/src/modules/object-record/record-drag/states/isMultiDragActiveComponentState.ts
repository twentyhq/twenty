import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const isMultiDragActiveComponentState = createComponentStateV2<boolean>({
  key: 'isMultiDragActiveComponentState',
  defaultValue: false,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
