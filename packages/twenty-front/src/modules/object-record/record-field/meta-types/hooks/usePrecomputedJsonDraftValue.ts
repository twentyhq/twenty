import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { WorkflowRunOutput } from '@/workflow/types/Workflow';
import { workflowRunOutputSchema } from '@/workflow/validation-schemas/workflowSchema';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { JsonObject, JsonValue } from 'type-fest';
import { parseJson } from '~/utils/parseJson';

export const usePrecomputedJsonDraftValue = ({
  draftValue,
}: {
  draftValue: string | undefined;
}): JsonValue => {
  const { fieldDefinition } = useContext(FieldContext);

  const parsedJsonValue = parseJson<JsonValue>(draftValue);

  if (
    fieldDefinition.metadata.objectMetadataNameSingular ===
      CoreObjectNameSingular.WorkflowRun &&
    fieldDefinition.metadata.fieldName === 'output' &&
    isDefined(draftValue)
  ) {
    const parsedValue = workflowRunOutputSchema.safeParse(parsedJsonValue);
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

    return orderedWorkflowRunOutput as JsonObject;
  }

  return parsedJsonValue;
};
