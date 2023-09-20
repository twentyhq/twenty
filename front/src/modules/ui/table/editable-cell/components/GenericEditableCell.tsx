import { FieldMetadata } from '@/ui/field/types/FieldMetadata';

import type { ViewFieldDefinition } from '../../../../views/types/ViewFieldDefinition';
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
  viewFieldDefinition: ViewFieldDefinition<FieldMetadata>;
};

export const GenericEditableCell = ({ viewFieldDefinition }: OwnProps) => {
  if (isViewFieldEmail(viewFieldDefinition)) {
    return (
      <GenericEditableEmailCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else if (isViewFieldText(viewFieldDefinition)) {
    return (
      <GenericEditableTextCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else if (isViewFieldRelation(viewFieldDefinition)) {
    return (
      <GenericEditableRelationCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else if (isViewFieldDoubleTextChip(viewFieldDefinition)) {
    return (
      <GenericEditableDoubleTextChipCell
        viewFieldDefinition={viewFieldDefinition}
      />
    );
  } else if (isViewFieldDoubleText(viewFieldDefinition)) {
    return (
      <GenericEditableDoubleTextCell
        viewFieldDefinition={viewFieldDefinition}
      />
    );
  } else if (isViewFieldPhone(viewFieldDefinition)) {
    return (
      <GenericEditablePhoneCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else if (isViewFieldURL(viewFieldDefinition)) {
    return <GenericEditableURLCell columnDefinition={viewFieldDefinition} />;
  } else if (isViewFieldDate(viewFieldDefinition)) {
    return (
      <GenericEditableDateCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else if (isViewFieldNumber(viewFieldDefinition)) {
    return <GenericEditableNumberCell columnDefinition={viewFieldDefinition} />;
  } else if (isViewFieldBoolean(viewFieldDefinition)) {
    return (
      <GenericEditableBooleanCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else if (isViewFieldChip(viewFieldDefinition)) {
    return (
      <GenericEditableChipCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else if (isViewFieldMoney(viewFieldDefinition)) {
    return (
      <GenericEditableMoneyCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else {
    console.warn(
      `Unknown field metadata type: ${viewFieldDefinition.type} in GenericEditableCell`,
    );
    return <></>;
  }
};
