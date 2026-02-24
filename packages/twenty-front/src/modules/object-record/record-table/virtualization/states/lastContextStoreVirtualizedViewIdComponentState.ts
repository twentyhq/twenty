import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const lastContextStoreVirtualizedViewIdComponentState =
  createComponentStateV2<string | null>({
    key: 'lastContextStoreVirtualizedViewIdComponentState',
    componentInstanceContext: ContextStoreComponentInstanceContext,
    defaultValue: null,
  });
