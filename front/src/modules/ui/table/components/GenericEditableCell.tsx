import { EntityFieldDefinition } from '@/ui/table/types/EntityFieldMetadata';

import { isEntityFieldChip } from '../types/guards/isEntityFieldChip';
import { isEntityFieldRelation } from '../types/guards/isEntityFieldRelation';
import { isEntityFieldText } from '../types/guards/isEntityFieldText';

import { GenericEditableChipCell } from './GenericEditableChipCell';
import { GenericEditableRelationCell } from './GenericEditableRelationCell';
import { GenericEditableTextCell } from './GenericEditableTextCell';

type OwnProps = {
  fieldDefinition: EntityFieldDefinition<unknown>;
};

export function GenericEditableCell({ fieldDefinition }: OwnProps) {
  if (isEntityFieldText(fieldDefinition)) {
    return (
      <GenericEditableTextCell
        fieldName={fieldDefinition.metadata.fieldName}
        placeholder={fieldDefinition.metadata.placeHolder}
        editModeHorizontalAlign="left"
      />
    );
  } else if (isEntityFieldRelation(fieldDefinition)) {
    return <GenericEditableRelationCell fieldDefinition={fieldDefinition} />;
  } else if (isEntityFieldChip(fieldDefinition)) {
    return (
      <GenericEditableChipCell
        fieldDefinition={fieldDefinition}
        editModeHorizontalAlign="left"
      />
    );
  } else {
    console.warn(
      `Unknown field type: ${fieldDefinition.type} in GenericEditableCell`,
    );
    return <></>;
  }
}
