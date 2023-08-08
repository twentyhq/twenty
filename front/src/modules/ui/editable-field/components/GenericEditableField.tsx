import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

import { isViewFieldDate } from '../types/guards/isViewFieldDate';
import { isViewFieldNumber } from '../types/guards/isViewFieldNumber';
import { isViewFieldProbability } from '../types/guards/isViewFieldProbability';
import { isViewFieldRelation } from '../types/guards/isViewFieldRelation';

import { GenericEditableDateField } from './GenericEditableDateField';
import { GenericEditableNumberField } from './GenericEditableNumberField';
import { GenericEditableRelationField } from './GenericEditableRelationField';
import { ProbabilityEditableField } from './ProbabilityEditableField';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldMetadata>;
};

export function GenericEditableField({ viewField: fieldDefinition }: OwnProps) {
  if (isViewFieldDate(fieldDefinition)) {
    return <GenericEditableDateField viewField={fieldDefinition} />;
  } else if (isViewFieldNumber(fieldDefinition)) {
    return <GenericEditableNumberField viewField={fieldDefinition} />;
  } else if (isViewFieldRelation(fieldDefinition)) {
    return <GenericEditableRelationField viewField={fieldDefinition} />;
  } else if (isViewFieldProbability(fieldDefinition)) {
    return <ProbabilityEditableField viewField={fieldDefinition} />;
  } else {
    console.warn(
      `Unknown field metadata type: ${fieldDefinition.metadata.type} in GenericEditableField`,
    );
    return <></>;
  }
}
