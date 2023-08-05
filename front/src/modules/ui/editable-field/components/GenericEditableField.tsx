import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

import { isViewFieldDate } from '../types/guards/isViewFieldDate';

import { GenericEditableDateField } from './GenericEditableDateField';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldMetadata>;
};

export function GenericEditableField({ viewField: fieldDefinition }: OwnProps) {
  if (isViewFieldDate(fieldDefinition)) {
    return <GenericEditableDateField viewField={fieldDefinition} />;
  } else {
    console.warn(
      `Unknown field metadata type: ${fieldDefinition.metadata.type} in GenericEditableField`,
    );
    return <></>;
  }
}
