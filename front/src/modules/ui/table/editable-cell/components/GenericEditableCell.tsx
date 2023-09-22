import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { isFieldBoolean } from '@/ui/field/types/guards/isFieldBoolean';
import { isFieldChip } from '@/ui/field/types/guards/isFieldChip';
import { isFieldDate } from '@/ui/field/types/guards/isFieldDate';
import { isFieldDoubleText } from '@/ui/field/types/guards/isFieldDoubleText';
import { isFieldDoubleTextChip } from '@/ui/field/types/guards/isFieldDoubleTextChip';
import { isFieldNumber } from '@/ui/field/types/guards/isFieldNumber';
import { isFieldPhone } from '@/ui/field/types/guards/isFieldPhone';
import { isFieldRelation } from '@/ui/field/types/guards/isFieldRelation';
import { isFieldText } from '@/ui/field/types/guards/isFieldText';
import { isFieldURL } from '@/ui/field/types/guards/isFieldURL';

import type { ViewFieldDefinition } from '../../../../views/types/ViewFieldDefinition';
import { GenericEditableBooleanCell } from '../type/components/GenericEditableBooleanCell';
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
  viewFieldDefinition: ViewFieldDefinition<FieldMetadata>;
};

export const GenericEditableCell = ({ viewFieldDefinition }: OwnProps) => {
  if (isFieldText(viewFieldDefinition)) {
    return (
      <GenericEditableTextCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else if (isFieldRelation(viewFieldDefinition)) {
    return (
      <GenericEditableRelationCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else if (isFieldDoubleTextChip(viewFieldDefinition)) {
    return (
      <GenericEditableDoubleTextChipCell
        viewFieldDefinition={viewFieldDefinition}
      />
    );
  } else if (isFieldDoubleText(viewFieldDefinition)) {
    return (
      <GenericEditableDoubleTextCell
        viewFieldDefinition={viewFieldDefinition}
      />
    );
  } else if (isFieldPhone(viewFieldDefinition)) {
    return (
      <GenericEditablePhoneCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else if (isFieldURL(viewFieldDefinition)) {
    return <GenericEditableURLCell columnDefinition={viewFieldDefinition} />;
  } else if (isFieldDate(viewFieldDefinition)) {
    return (
      <GenericEditableDateCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else if (isFieldNumber(viewFieldDefinition)) {
    return (
      <GenericEditableNumberCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else if (isFieldBoolean(viewFieldDefinition)) {
    return (
      <GenericEditableBooleanCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else if (isFieldChip(viewFieldDefinition)) {
    return (
      <GenericEditableChipCell viewFieldDefinition={viewFieldDefinition} />
    );
  } else {
    return <></>;
  }
};
