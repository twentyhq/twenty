import { type ViewField } from '@/views/types/ViewField';
import { type CoreViewField } from '~/generated/graphql';

export const convertCoreViewFieldToViewField = (
  coreViewField: Omit<CoreViewField, 'workspaceId'>,
): ViewField => {
  const partial: ViewField = {
    __typename: 'ViewField',
    id: coreViewField.id,
    fieldMetadataId: coreViewField.fieldMetadataId,
    position: coreViewField.position,
    isVisible: coreViewField.isVisible,
    size: coreViewField.size,
    aggregateOperation: coreViewField.aggregateOperation ?? null,
    definition: undefined,
  };

  return partial;
};
