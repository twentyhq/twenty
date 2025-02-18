import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const contextStoreCurrentObjectMetadataItemComponentState =
  createComponentStateV2<ObjectMetadataItem | undefined>({
    key: 'contextStoreCurrentObjectMetadataItemComponentState',
    defaultValue: undefined,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
