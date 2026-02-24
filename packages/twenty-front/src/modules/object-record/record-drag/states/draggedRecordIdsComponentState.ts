import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const draggedRecordIdsComponentState = createComponentStateV2<string[]>({
  key: 'draggedRecordIdsComponentState',
  defaultValue: [],
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
