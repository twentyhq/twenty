import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const primaryDraggedRecordIdComponentState = createComponentState<
  string | null
>({
  key: 'primaryDraggedRecordIdComponentState',
  defaultValue: null,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
