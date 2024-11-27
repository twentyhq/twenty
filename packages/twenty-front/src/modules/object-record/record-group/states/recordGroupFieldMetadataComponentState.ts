import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordGroupFieldMetadataComponentState = createComponentStateV2<
  FieldMetadataItem | undefined
>({
  key: 'recordGroupFieldMetadataComponentState',
  defaultValue: undefined,
  componentInstanceContext: ViewComponentInstanceContext,
});
