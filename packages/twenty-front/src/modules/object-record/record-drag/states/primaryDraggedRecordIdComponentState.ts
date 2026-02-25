import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const primaryDraggedRecordIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'primaryDraggedRecordIdComponentState',
  defaultValue: null,
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
