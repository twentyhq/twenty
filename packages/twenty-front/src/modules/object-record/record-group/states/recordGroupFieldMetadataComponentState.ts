import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordGroupFieldMetadataComponentState = createComponentState<
  FieldMetadataItem | undefined
>({
  key: 'recordGroupFieldMetadataComponentState',
  defaultValue: undefined,
  componentInstanceContext: ViewComponentInstanceContext,
});
