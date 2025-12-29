import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexGroupFieldMetadataItemComponentState =
  createComponentState<FieldMetadataItem | undefined>({
    key: 'recordIndexGroupFieldMetadataItemComponentState',
    defaultValue: undefined,
    componentInstanceContext: ViewComponentInstanceContext,
  });
