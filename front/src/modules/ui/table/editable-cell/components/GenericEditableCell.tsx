import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/table/types/ViewField';

import { isViewFieldChip } from '../../types/guards/isViewFieldChip';
import { isViewFieldDate } from '../../types/guards/isViewFieldDate';
import { isViewFieldDoubleText } from '../../types/guards/isViewFieldDoubleText';
import { isViewFieldDoubleTextChip } from '../../types/guards/isViewFieldDoubleTextChip';
import { isViewFieldNumber } from '../../types/guards/isViewFieldNumber';
import { isViewFieldPhone } from '../../types/guards/isViewFieldPhone';
import { isViewFieldRelation } from '../../types/guards/isViewFieldRelation';
import { isViewFieldText } from '../../types/guards/isViewFieldText';
import { isViewFieldURL } from '../../types/guards/isViewFieldURL';
import { GenericEditableChipCell } from '../type/components/GenericEditableChipCell';
import { GenericEditableDateCell } from '../type/components/GenericEditableDateCell';
import { GenericEditableDoubleTextCell } from '../type/components/GenericEditableDoubleTextCell';
import { GenericEditableDoubleTextChipCell } from '../type/components/GenericEditableDoubleTextChipCell';
import { GenericEditableNumberCell } from '../type/components/GenericEditableNumberCell';
import { GenericEditablePhoneCell } from '../type/components/GenericEditablePhoneCell';
import { GenericEditableRelationCell } from '../type/components/GenericEditableRelationCell';
import { GenericEditableTextCell } from '../type/components/GenericEditableTextCell';
import { GenericEditableURLCell } from '../type/components/GenericEditableURLCell';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldMetadata>;
};

export function GenericEditableCell({ viewField: fieldDefinition }: OwnProps) {
  if (isViewFieldText(fieldDefinition)) {
    return <GenericEditableTextCell viewField={fieldDefinition} />;
  } else if (isViewFieldRelation(fieldDefinition)) {
    return <GenericEditableRelationCell fieldDefinition={fieldDefinition} />;
  } else if (isViewFieldDoubleTextChip(fieldDefinition)) {
    return <GenericEditableDoubleTextChipCell viewField={fieldDefinition} />;
  } else if (isViewFieldDoubleText(fieldDefinition)) {
    return <GenericEditableDoubleTextCell viewField={fieldDefinition} />;
  } else if (isViewFieldPhone(fieldDefinition)) {
    return <GenericEditablePhoneCell viewField={fieldDefinition} />;
  } else if (isViewFieldURL(fieldDefinition)) {
    return <GenericEditableURLCell viewField={fieldDefinition} />;
  } else if (isViewFieldDate(fieldDefinition)) {
    return <GenericEditableDateCell viewField={fieldDefinition} />;
  } else if (isViewFieldNumber(fieldDefinition)) {
    return <GenericEditableNumberCell viewField={fieldDefinition} />;
  } else if (isViewFieldChip(fieldDefinition)) {
    return <GenericEditableChipCell viewField={fieldDefinition} />;
  } else {
    console.warn(
      `Unknown field metadata type: ${fieldDefinition.metadata.type} in GenericEditableCell`,
    );
    return <></>;
  }
}
