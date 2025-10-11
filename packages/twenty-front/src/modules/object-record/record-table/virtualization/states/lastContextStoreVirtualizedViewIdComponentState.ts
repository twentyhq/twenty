import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const lastContextStoreVirtualizedViewIdComponentState =
  createComponentState<string | null>({
    key: 'lastContextStoreVirtualizedViewIdComponentState',
    componentInstanceContext: ContextStoreComponentInstanceContext,
    defaultValue: null,
  });
