import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowStep } from '@/workflow/types/Workflow';
import { getWorkflowVariablesUsedInStep } from '@/workflow/workflow-steps/utils/getWorkflowVariablesUsedInStep';
import { HttpRequestFormData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { httpRequestTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/http-request-action/states/httpRequestTestDataFamilyState';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledVariableContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledVariableLabel = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

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
  const [httpRequestTestData, setHttpRequestTestData] = useRecoilState(
    httpRequestTestDataFamilyState(actionId),
  );
  const mockStep: WorkflowStep = {
    id: 'test-step',
    name: 'Test Step',
    type: 'HTTP_REQUEST',
    valid: true,
    settings: {
      input: httpRequestFormData,
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
    },
  };

  const variablesUsed = getWorkflowVariablesUsedInStep({ step: mockStep });
  const variableArray = Array.from(variablesUsed);

  const handleVariableChange = (variablePath: string, value: string) => {
    setHttpRequestTestData((prev) => ({
      ...prev,
      variableValues: {
        ...prev.variableValues,
        [variablePath]: value,
      },
    }));
  };

  if (variableArray.length === 0) {
    return null;
  }

  return (
    <FormFieldInputContainer>
      <InputLabel>Test Variables</InputLabel>
      <StyledContainer>
        {variableArray.map((variablePath) => (
          <StyledVariableContainer key={variablePath}>
            <StyledVariableLabel>
              Variable: <code>{`{{${variablePath}}}`}</code>
            </StyledVariableLabel>
            <FormTextFieldInput
              placeholder="Enter test value"
              readonly={readonly}
              defaultValue={
                httpRequestTestData.variableValues[variablePath] || ''
              }
              onChange={(value) =>
                handleVariableChange(variablePath, value || '')
              }
            />
          </StyledVariableContainer>
        ))}
      </StyledContainer>
    </FormFieldInputContainer>
  );
};
