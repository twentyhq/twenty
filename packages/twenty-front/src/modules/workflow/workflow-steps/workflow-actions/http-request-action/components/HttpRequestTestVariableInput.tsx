import { type WorkflowStep } from '@/workflow/types/Workflow';
import { WorkflowStepTestVariableInput } from '@/workflow/workflow-steps/components/WorkflowStepTestVariableInput';
import { type HttpRequestFormData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { httpRequestTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/http-request-action/states/httpRequestTestDataFamilyState';
import { useLingui } from '@lingui/react/macro';

type HttpRequestTestVariableInputProps = {
  httpRequestFormData: HttpRequestFormData;
  actionId: string;
  readonly?: boolean;
};

export const HttpRequestTestVariableInput = ({
  httpRequestFormData,
  actionId,
  readonly,
}: HttpRequestTestVariableInputProps) => {
  const { t } = useLingui();
  const mockStep: WorkflowStep = {
    id: actionId,
    name: t`Test Step`,
    type: 'HTTP_REQUEST',
    valid: true,
    settings: {
      input: httpRequestFormData,
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
    },
  };

  return (
    <WorkflowStepTestVariableInput
      step={mockStep}
      testDataFamilyState={httpRequestTestDataFamilyState}
      readonly={readonly}
    />
  );
};
