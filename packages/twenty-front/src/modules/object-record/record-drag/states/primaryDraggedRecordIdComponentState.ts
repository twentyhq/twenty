import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const primaryDraggedRecordIdComponentState = createComponentStateV2<
  string | null
>({
  key: 'primaryDraggedRecordIdComponentState',
  defaultValue: null,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
