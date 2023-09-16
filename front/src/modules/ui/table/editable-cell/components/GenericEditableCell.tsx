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
  columnDefinition: ColumnDefinition<ViewFieldMetadata>;
};

export const GenericEditableCell = ({ columnDefinition }: OwnProps) => {
  if (isViewFieldEmail(columnDefinition)) {
    return <GenericEditableEmailCell columnDefinition={columnDefinition} />;
  } else if (isViewFieldText(columnDefinition)) {
    return <GenericEditableTextCell columnDefinition={columnDefinition} />;
  } else if (isViewFieldRelation(columnDefinition)) {
    return <GenericEditableRelationCell columnDefinition={columnDefinition} />;
  } else if (isViewFieldDoubleTextChip(columnDefinition)) {
    return (
      <GenericEditableDoubleTextChipCell columnDefinition={columnDefinition} />
    );
  } else if (isViewFieldDoubleText(columnDefinition)) {
    return (
      <GenericEditableDoubleTextCell columnDefinition={columnDefinition} />
    );
  } else if (isViewFieldPhone(columnDefinition)) {
    return <GenericEditablePhoneCell columnDefinition={columnDefinition} />;
  } else if (isViewFieldURL(columnDefinition)) {
    return <GenericEditableURLCell columnDefinition={columnDefinition} />;
  } else if (isViewFieldDate(columnDefinition)) {
    return <GenericEditableDateCell columnDefinition={columnDefinition} />;
  } else if (isViewFieldNumber(columnDefinition)) {
    return <GenericEditableNumberCell columnDefinition={columnDefinition} />;
  } else if (isViewFieldBoolean(columnDefinition)) {
    return <GenericEditableBooleanCell columnDefinition={columnDefinition} />;
  } else if (isViewFieldChip(columnDefinition)) {
    return <GenericEditableChipCell columnDefinition={columnDefinition} />;
  } else if (isViewFieldMoney(columnDefinition)) {
    return <GenericEditableMoneyCell columnDefinition={columnDefinition} />;
  } else {
    console.warn(
      `Unknown field metadata type: ${columnDefinition.metadata.type} in GenericEditableCell`,
    );
    return <></>;
  }
};
