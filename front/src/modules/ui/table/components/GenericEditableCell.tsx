import { ViewFieldDefinition } from '@/ui/table/types/ViewField';

import { isViewFieldChip } from '../types/guards/isViewFieldChip';
import { isViewFieldRelation } from '../types/guards/isViewFieldRelation';
import { isViewFieldText } from '../types/guards/isViewFieldText';

import { GenericEditableChipCell } from './GenericEditableChipCell';
import { GenericEditableRelationCell } from './GenericEditableRelationCell';
import { GenericEditableTextCell } from './GenericEditableTextCell';

type OwnProps = {
  fieldDefinition: ViewFieldDefinition<unknown>;
};

export function GenericEditableCell({ fieldDefinition }: OwnProps) {
  if (isViewFieldText(fieldDefinition)) {
    return (
      <GenericEditableTextCell
        viewField={fieldDefinition}
        editModeHorizontalAlign="left"
      />
    );
  } else if (isViewFieldRelation(fieldDefinition)) {
    return <GenericEditableRelationCell fieldDefinition={fieldDefinition} />;
  } else if (isViewFieldChip(fieldDefinition)) {
    return (
      <GenericEditableChipCell
        viewField={fieldDefinition}
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
