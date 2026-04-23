import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { type ManualTriggerOutputSchema } from '@/workflow/workflow-variables/types/ManualTriggerOutputSchema';
import { searchVariableThroughBaseOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughBaseOutputSchema';
import { searchVariableThroughRecordOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughRecordOutputSchema';

export const searchVariableThroughManualTriggerOutputSchema = ({
  stepName,
  manualTriggerOutputSchema,
  rawVariableName,
  isFullRecord,
}: {
  stepName: string;
  manualTriggerOutputSchema: ManualTriggerOutputSchema;
  rawVariableName: string;
  isFullRecord: boolean;
}) => {
  if (isRecordOutputSchemaV2(manualTriggerOutputSchema)) {
    return searchVariableThroughRecordOutputSchema({
      stepName,
      recordOutputSchema: manualTriggerOutputSchema,
      rawVariableName,
      isFullRecord,
    });
  }

  return searchVariableThroughBaseOutputSchema({
    stepName,
    baseOutputSchema: manualTriggerOutputSchema,
    rawVariableName,
  });
};
