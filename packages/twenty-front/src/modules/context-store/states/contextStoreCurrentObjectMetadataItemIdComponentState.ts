import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const contextStoreCurrentObjectMetadataItemIdComponentState =
  createAtomComponentState<string | undefined>({
    key: 'contextStoreCurrentObjectMetadataItemIdComponentState',
    defaultValue: undefined,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
