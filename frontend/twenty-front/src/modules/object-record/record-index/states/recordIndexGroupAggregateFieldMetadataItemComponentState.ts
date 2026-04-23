import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordIndexGroupAggregateFieldMetadataItemComponentState =
  createAtomComponentState<FieldMetadataItem | null>({
    key: 'recordIndexGroupAggregateFieldMetadataItemComponentState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
