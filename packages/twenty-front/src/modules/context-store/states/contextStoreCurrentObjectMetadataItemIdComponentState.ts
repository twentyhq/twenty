import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const contextStoreCurrentObjectMetadataItemIdComponentState =
  createComponentStateV2<string | undefined>({
    key: 'contextStoreCurrentObjectMetadataItemIdComponentState',
    defaultValue: undefined,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
