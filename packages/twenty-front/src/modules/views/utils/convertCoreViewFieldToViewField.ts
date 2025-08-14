import { type ViewField } from '@/views/types/ViewField';
import { type CoreViewField } from '~/generated/graphql';

export const convertCoreViewFieldToViewField = (
  coreViewField: Omit<CoreViewField, 'workspaceId'>,
): Omit<ViewField, 'definition'> => {
  const viewField: Omit<ViewField, 'definition'> = {
    __typename: 'ViewField',
    id: coreViewField.id,
    fieldMetadataId: coreViewField.fieldMetadataId,
    position: coreViewField.position,
    isVisible: coreViewField.isVisible,
    size: coreViewField.size,
    aggregateOperation: coreViewField.aggregateOperation ?? null,
  };

  return viewField;
};
