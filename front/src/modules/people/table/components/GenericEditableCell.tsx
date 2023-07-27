import { EntityFieldMetadata } from '@/ui/table/types/EntityFieldMetadata';

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

    default:
      return <></>;
  }
}
