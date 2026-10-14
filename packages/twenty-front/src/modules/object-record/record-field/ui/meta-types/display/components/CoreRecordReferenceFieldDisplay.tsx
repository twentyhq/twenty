import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type CoreRecordReferenceField } from '@/object-record/record-field/ui/types/CoreRecordReferenceField';
import { getCoreRecordIdFieldDefinition } from '@/object-record/record-field/ui/utils/getCoreRecordIdFieldDefinition';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { type FieldDisplayTooltipProps } from '@/ui/field/display/types/FieldDisplayTooltipProps';

type CoreRecordReferenceFieldDisplayProps = FieldDisplayTooltipProps & {
  coreRecordReferenceField: CoreRecordReferenceField;
};

export const CoreRecordReferenceFieldDisplay = ({
  coreRecordReferenceField,
  withTooltip,
  measureOverflowOnOpen,
}: CoreRecordReferenceFieldDisplayProps) => {
  const { recordId } = useContext(FieldContext);

  const coreRecordIdFieldDefinition = getCoreRecordIdFieldDefinition(
    coreRecordReferenceField,
  );

  const coreRecordId = useRecordFieldValue<string | null>(
    recordId,
    coreRecordIdFieldDefinition.metadata.fieldName,
    coreRecordIdFieldDefinition,
  );

  if (!isDefined(coreRecordId)) {
    return null;
  }

  const { CoreRecordDisplay } = coreRecordReferenceField;

  return (
    <CoreRecordDisplay
      coreRecordId={coreRecordId}
      withTooltip={withTooltip}
      measureOverflowOnOpen={measureOverflowOnOpen}
    />
  );
};
