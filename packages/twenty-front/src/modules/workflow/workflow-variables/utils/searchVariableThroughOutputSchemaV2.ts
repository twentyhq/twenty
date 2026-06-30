import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import {
  searchVariableInOutputSchema,
  type VariableSearchResult,
} from 'twenty-shared/workflow';

export const searchVariableThroughOutputSchemaV2 = ({
  stepOutputSchema,
  stepType,
  rawVariableName,
  isFullRecord,
}: {
  stepOutputSchema: StepOutputSchemaV2;
  stepType: WorkflowTriggerType | WorkflowActionType;
  rawVariableName: string;
  isFullRecord: boolean;
}): VariableSearchResult => {
  return searchVariableInOutputSchema({
    schema: stepOutputSchema.outputSchema,
    stepType,
    stepName: stepOutputSchema.name,
    rawVariableName,
    isFullRecord,
    stepNameLabel: stepOutputSchema.objectName,
  });
};
