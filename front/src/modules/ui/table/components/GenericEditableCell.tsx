import { EntityFieldMetadata } from '@/ui/table/types/EntityFieldMetadata';

import { GenericEditableRelationCell } from './GenericEditableRelationCell';
import { GenericEditableTextCell } from './GenericEditableTextCell';

type OwnProps = {
  entityFieldMetadata: EntityFieldMetadata;
};

export function GenericEditableCell({ entityFieldMetadata }: OwnProps) {
  switch (entityFieldMetadata.type) {
    case 'text':
      return (
        <GenericEditableTextCell
          fieldName={entityFieldMetadata.fieldName}
          placeholder={entityFieldMetadata.label}
          editModeHorizontalAlign="left"
        />
      );
    case 'relation': {
      return (
        <GenericEditableRelationCell fieldMetadata={entityFieldMetadata} />
      );
    }
    default:
      console.warn(
        `Unknown field type: ${entityFieldMetadata.type} in GenericEditableCell`,
      );
      return <></>;
  }
}
