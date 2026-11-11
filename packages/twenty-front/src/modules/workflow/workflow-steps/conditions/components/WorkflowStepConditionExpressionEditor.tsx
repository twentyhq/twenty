import { isDefined } from 'twenty-shared/utils';
import {
  extractRawVariableNamePart,
  TRIGGER_STEP_ID,
} from 'twenty-shared/workflow';
import { Card } from 'twenty-ui/primitives/surfaces';

import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { ValidationRuleExpressionEditor } from '@/validation-rules/components/ValidationRuleExpressionEditor';
import { ValidationRuleExpressionText } from '@/validation-rules/components/ValidationRuleExpressionText';
import { type ValidationRuleFieldNodeAttributes } from '@/validation-rules/types/ValidationRuleFieldNodeAttributes';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { searchVariableThroughOutputSchemaV2 } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchemaV2';

type WorkflowStepConditionExpressionEditorProps = {
  instanceId: string;
  condition: string;
  onConditionChange: (condition: string) => void;
  readonly: boolean;
};

export const WorkflowStepConditionExpressionEditor = ({
  instanceId,
  condition,
  onConditionChange,
  readonly,
}: WorkflowStepConditionExpressionEditorProps) => {
  const flow = useFlowOrThrow();
  const [triggerOutputSchema, ...stepOutputSchemas] =
    useAtomFamilySelectorValue(stepsOutputSchemaFamilySelector, {
      workflowVersionId: flow.workflowVersionId,
      stepIds: [TRIGGER_STEP_ID, ...(flow.steps ?? []).map(({ id }) => id)],
    });
  const outputSchemas = [triggerOutputSchema, ...stepOutputSchemas].filter(
    isDefined,
  );

  const getVariableNodeAttributes = (
    variable: string,
  ): ValidationRuleFieldNodeAttributes | null => {
    const stepId = extractRawVariableNamePart({
      rawVariableName: variable,
      part: 'stepId',
    });
    const stepOutputSchema = outputSchemas.find(({ id }) => id === stepId);

    if (!isDefined(stepOutputSchema)) {
      return null;
    }

    const { variableLabel } = searchVariableThroughOutputSchemaV2({
      stepOutputSchema,
      stepType: stepOutputSchema.type,
      rawVariableName: variable,
      isFullRecord: false,
    });

    return isDefined(variableLabel)
      ? {
          path: variable,
          label: variableLabel,
          iconName: stepOutputSchema.icon ?? '',
        }
      : null;
  };

  if (readonly) {
    return <ValidationRuleExpressionText expression={condition} />;
  }

  return (
    <Card.Root fullWidth>
      <ValidationRuleExpressionEditor
        value={condition}
        fields={[]}
        editorFields={[]}
        onChange={onConditionChange}
        variables={{
          getVariableNodeAttributes,
          renderVariablePicker: (onVariableSelect) => (
            <WorkflowVariablesDropdown
              instanceId={instanceId}
              onVariableSelect={onVariableSelect}
              shouldDisplayRecordFields
              shouldDisplayRecordObjects={false}
            />
          ),
        }}
      />
    </Card.Root>
  );
};
