import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const contextStoreCurrentObjectMetadataIdComponentState =
  createComponentStateV2<string | null>({
    key: 'contextStoreCurrentObjectMetadataIdComponentState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
