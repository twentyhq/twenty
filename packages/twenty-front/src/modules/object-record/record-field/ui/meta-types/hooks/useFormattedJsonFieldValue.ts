import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { orderWorkflowRunState } from '@/object-record/record-field/ui/meta-types/utils/orderWorkflowRunState';
import { type FieldJsonValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useFormattedJsonFieldValue = ({
  fieldValue,
}: {
  fieldValue: FieldJsonValue | undefined;
}): FieldJsonValue | undefined => {
  const { fieldDefinition } = useContext(FieldContext);

  if (
    fieldDefinition.metadata.objectMetadataNameSingular ===
      CoreObjectNameSingular.WorkflowRun &&
    fieldDefinition.metadata.fieldName === 'state' &&
    isDefined(fieldValue)
  ) {
    return orderWorkflowRunState(fieldValue) as FieldJsonValue;
  }

  return fieldValue;
};
