import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const originalDragSelectionComponentState = createComponentStateV2<
  string[]
>({
  key: 'originalDragSelectionComponentState',
  defaultValue: [],
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
