import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexGroupFieldMetadataItemComponentState =
  createAtomComponentState<FieldMetadataItem | undefined>({
    key: 'recordIndexGroupFieldMetadataItemComponentState',
    defaultValue: undefined,
    componentInstanceContext: ViewComponentInstanceContext,
  });
