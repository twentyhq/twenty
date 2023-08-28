import { isViewFieldBoolean } from '@/ui/editable-field/types/guards/isViewFieldBoolean';
import { isViewFieldChip } from '@/ui/editable-field/types/guards/isViewFieldChip';
import { isViewFieldDate } from '@/ui/editable-field/types/guards/isViewFieldDate';
import { isViewFieldDoubleText } from '@/ui/editable-field/types/guards/isViewFieldDoubleText';
import { isViewFieldDoubleTextChip } from '@/ui/editable-field/types/guards/isViewFieldDoubleTextChip';
import { isViewFieldEmail } from '@/ui/editable-field/types/guards/isViewFieldEmail';
import { isViewFieldMoney } from '@/ui/editable-field/types/guards/isViewFieldMoney';
import { isViewFieldNumber } from '@/ui/editable-field/types/guards/isViewFieldNumber';
import { isViewFieldPhone } from '@/ui/editable-field/types/guards/isViewFieldPhone';
import { isViewFieldRelation } from '@/ui/editable-field/types/guards/isViewFieldRelation';
import { isViewFieldText } from '@/ui/editable-field/types/guards/isViewFieldText';
import { isViewFieldURL } from '@/ui/editable-field/types/guards/isViewFieldURL';
import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import type { ColumnDefinition } from '../../types/ColumnDefinition';
import { GenericEditableBooleanCell } from '../type/components/GenericEditableBooleanCell';
import { GenericEditableChipCell } from '../type/components/GenericEditableChipCell';
import { GenericEditableDateCell } from '../type/components/GenericEditableDateCell';
import { GenericEditableDoubleTextCell } from '../type/components/GenericEditableDoubleTextCell';
import { GenericEditableDoubleTextChipCell } from '../type/components/GenericEditableDoubleTextChipCell';
import { GenericEditableEmailCell } from '../type/components/GenericEditableEmailCell';
import { GenericEditableMoneyCell } from '../type/components/GenericEditableMoneyCell';
import { GenericEditableNumberCell } from '../type/components/GenericEditableNumberCell';
import { GenericEditablePhoneCell } from '../type/components/GenericEditablePhoneCell';
import { GenericEditableRelationCell } from '../type/components/GenericEditableRelationCell';
import { GenericEditableTextCell } from '../type/components/GenericEditableTextCell';
import { GenericEditableURLCell } from '../type/components/GenericEditableURLCell';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldMetadata>;
};

export function GenericEditableCell({ fieldDefinition }: OwnProps) {
  if (isViewFieldEmail(fieldDefinition)) {
    return <GenericEditableEmailCell fieldDefinition={fieldDefinition} />;
  } else if (isViewFieldText(fieldDefinition)) {
    return <GenericEditableTextCell fieldDefinition={fieldDefinition} />;
  } else if (isViewFieldRelation(fieldDefinition)) {
    return <GenericEditableRelationCell fieldDefinition={fieldDefinition} />;
  } else if (isViewFieldDoubleTextChip(fieldDefinition)) {
    return (
      <GenericEditableDoubleTextChipCell fieldDefinition={fieldDefinition} />
    );
  } else if (isViewFieldDoubleText(fieldDefinition)) {
    return <GenericEditableDoubleTextCell fieldDefinition={fieldDefinition} />;
  } else if (isViewFieldPhone(fieldDefinition)) {
    return <GenericEditablePhoneCell fieldDefinition={fieldDefinition} />;
  } else if (isViewFieldURL(fieldDefinition)) {
    return <GenericEditableURLCell fieldDefinition={fieldDefinition} />;
  } else if (isViewFieldDate(fieldDefinition)) {
    return <GenericEditableDateCell fieldDefinition={fieldDefinition} />;
  } else if (isViewFieldNumber(fieldDefinition)) {
    return <GenericEditableNumberCell fieldDefinition={fieldDefinition} />;
  } else if (isViewFieldBoolean(fieldDefinition)) {
    return <GenericEditableBooleanCell fieldDefinition={fieldDefinition} />;
  } else if (isViewFieldChip(fieldDefinition)) {
    return <GenericEditableChipCell fieldDefinition={fieldDefinition} />;
  } else if (isViewFieldMoney(fieldDefinition)) {
    return <GenericEditableMoneyCell fieldDefinition={fieldDefinition} />;
  } else {
    console.warn(
      `Unknown field metadata type: ${fieldDefinition.metadata.type} in GenericEditableCell`,
    );
    return <></>;
  }
}
