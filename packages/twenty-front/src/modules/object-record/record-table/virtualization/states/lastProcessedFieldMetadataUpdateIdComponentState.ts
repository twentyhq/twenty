import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const lastProcessedFieldMetadataUpdateIdComponentState =
  createComponentState<string | null>({
    key: 'lastProcessedFieldMetadataUpdateIdComponentState',
    componentInstanceContext: ContextStoreComponentInstanceContext,
    defaultValue: null,
  });
