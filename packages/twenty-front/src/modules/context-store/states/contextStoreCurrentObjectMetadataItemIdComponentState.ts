import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const contextStoreCurrentObjectMetadataItemIdComponentState =
  createComponentState<string | undefined>({
    key: 'contextStoreCurrentObjectMetadataItemIdComponentState',
    defaultValue: undefined,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
