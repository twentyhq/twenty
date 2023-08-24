import { isViewFieldBoolean } from '@/ui/editable-field/types/guards/isViewFieldBoolean';
import { isViewFieldDate } from '@/ui/editable-field/types/guards/isViewFieldDate';
import { isViewFieldDoubleText } from '@/ui/editable-field/types/guards/isViewFieldDoubleText';
import { isViewFieldDoubleTextChip } from '@/ui/editable-field/types/guards/isViewFieldDoubleTextChip';
import { isViewFieldMoney } from '@/ui/editable-field/types/guards/isViewFieldMoney';
import { isViewFieldNumber } from '@/ui/editable-field/types/guards/isViewFieldNumber';
import { isViewFieldPhone } from '@/ui/editable-field/types/guards/isViewFieldPhone';
import { isViewFieldRelation } from '@/ui/editable-field/types/guards/isViewFieldRelation';
import { isViewFieldText } from '@/ui/editable-field/types/guards/isViewFieldText';
import { isViewFieldURL } from '@/ui/editable-field/types/guards/isViewFieldURL';
import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

import { isViewFieldChip } from '../../../editable-field/types/guards/isViewFieldChip';
import { GenericEditableBooleanCell } from '../type/components/GenericEditableBooleanCell';
import { GenericEditableChipCell } from '../type/components/GenericEditableChipCell';
import { GenericEditableDateCell } from '../type/components/GenericEditableDateCell';
import { GenericEditableDoubleTextCell } from '../type/components/GenericEditableDoubleTextCell';
import { GenericEditableDoubleTextChipCell } from '../type/components/GenericEditableDoubleTextChipCell';
import { GenericEditableMoneyCell } from '../type/components/GenericEditableMoneyCell';
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
  } else if (isViewFieldBoolean(fieldDefinition)) {
    return <GenericEditableBooleanCell viewField={fieldDefinition} />;
  } else if (isViewFieldChip(fieldDefinition)) {
    return <GenericEditableChipCell viewField={fieldDefinition} />;
  } else if (isViewFieldMoney(fieldDefinition)) {
    return <GenericEditableMoneyCell viewField={fieldDefinition} />;
  } else {
    console.warn(
      `Unknown field metadata type: ${fieldDefinition.metadata.type} in GenericEditableCell`,
    );
    return <></>;
  }
}
