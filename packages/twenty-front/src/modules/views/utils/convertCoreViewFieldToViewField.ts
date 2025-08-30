import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { type ViewField } from '@/views/types/ViewField';
import { type CoreViewField } from '~/generated/graphql';

export const convertCoreViewFieldToViewField = (
  coreViewField: Pick<
    CoreViewField,
    | 'id'
    | 'fieldMetadataId'
    | 'position'
    | 'isVisible'
    | 'size'
    | 'aggregateOperation'
  >,
): ViewField => {
  const viewField: ViewField = {
    __typename: 'ViewField',
    id: coreViewField.id,
    fieldMetadataId: coreViewField.fieldMetadataId,
    position: coreViewField.position,
    isVisible: coreViewField.isVisible,
    size: coreViewField.size,
    aggregateOperation: coreViewField.aggregateOperation ?? null,
    // TODO: remove this once we have refactored the view field definition
    definition: undefined as unknown as ColumnDefinition<FieldMetadata>,
  };

  return viewField;
};
