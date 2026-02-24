import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexGroupFieldMetadataItemComponentState =
  createComponentStateV2<FieldMetadataItem | undefined>({
    key: 'recordIndexGroupFieldMetadataItemComponentState',
    defaultValue: undefined,
    componentInstanceContext: ViewComponentInstanceContext,
  });
