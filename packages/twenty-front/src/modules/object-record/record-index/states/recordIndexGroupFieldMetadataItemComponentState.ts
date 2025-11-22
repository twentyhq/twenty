import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordIndexGroupFieldMetadataItemComponentState =
  createComponentState<FieldMetadataItem | null>({
    key: 'recordIndexGroupFieldMetadataItemComponentState',
    defaultValue: null,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
