import { ViewFieldDefinition } from '@/ui/table/types/ViewField';

import { isViewFieldChip } from '../types/guards/isViewFieldChip';
import { isViewFieldDoubleText } from '../types/guards/isViewFieldDoubleText';
import { isViewFieldDoubleTextChip } from '../types/guards/isViewFieldDoubleTextChip';
import { isViewFieldRelation } from '../types/guards/isViewFieldRelation';
import { isViewFieldText } from '../types/guards/isViewFieldText';

import { GenericEditableChipCell } from './GenericEditableChipCell';
import { GenericEditableDoubleTextCell } from './GenericEditableDoubleTextCell';
import { GenericEditableDoubleTextChipCell } from './GenericEditableDoubleTextChipCell';
import { GenericEditableRelationCell } from './GenericEditableRelationCell';
import { GenericEditableTextCell } from './GenericEditableTextCell';

type OwnProps = {
  viewField: ViewFieldDefinition<unknown>;
};

export function GenericEditableCell({ viewField: fieldDefinition }: OwnProps) {
  if (isViewFieldText(fieldDefinition)) {
    return (
      <GenericEditableTextCell
        viewField={fieldDefinition}
        editModeHorizontalAlign="left"
      />
    );
  } else if (isViewFieldRelation(fieldDefinition)) {
    return <GenericEditableRelationCell fieldDefinition={fieldDefinition} />;
  } else if (isViewFieldDoubleTextChip(fieldDefinition)) {
    return <GenericEditableDoubleTextChipCell viewField={fieldDefinition} />;
  } else if (isViewFieldDoubleText(fieldDefinition)) {
    return <GenericEditableDoubleTextCell viewField={fieldDefinition} />;
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
