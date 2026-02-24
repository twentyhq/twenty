import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordIndexGroupAggregateFieldMetadataItemComponentState =
  createComponentStateV2<FieldMetadataItem | null>({
    key: 'recordIndexGroupAggregateFieldMetadataItemComponentState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
