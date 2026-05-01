import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const lastLoadedRecordTableWidgetViewIdComponentState =
  createAtomComponentState<{
    viewId: string;
    objectMetadataItemUpdatedAt: string;
    loadedViewContentSignature: string;
  } | null>({
    key: 'lastLoadedRecordTableWidgetViewIdComponentState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
