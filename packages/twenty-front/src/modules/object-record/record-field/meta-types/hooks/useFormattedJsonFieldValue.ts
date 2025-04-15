import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldJsonValue } from '@/object-record/record-field/types/FieldMetadata';
import { WorkflowRunOutput } from '@/workflow/types/Workflow';
import { workflowRunOutputSchema } from '@/workflow/validation-schemas/workflowSchema';
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
    fieldDefinition.metadata.fieldName === 'output' &&
    isDefined(fieldValue)
  ) {
    const parsedValue = workflowRunOutputSchema.safeParse(fieldValue);
    if (!parsedValue.success) {
      return null;
    }

    const orderedWorkflowRunOutput: WorkflowRunOutput = {
      ...(isDefined(parsedValue.data.error)
        ? {
            error: parsedValue.data.error,
          }
        : {}),
      ...(isDefined(parsedValue.data.stepsOutput)
        ? {
            stepsOutput: parsedValue.data.stepsOutput,
          }
        : {}),
      flow: parsedValue.data.flow,
    };

    return orderedWorkflowRunOutput as FieldJsonValue;
  }

  return fieldValue;
};
