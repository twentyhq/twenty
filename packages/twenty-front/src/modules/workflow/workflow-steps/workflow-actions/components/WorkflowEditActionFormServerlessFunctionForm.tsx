import { INDEX_FILE_PATH } from '@/serverless-functions/constants/IndexFilePath';
import { WorkflowEditActionFormServerlessFunctionFields } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionFormServerlessFunctionFields';
import { FunctionInput } from '@/workflow/workflow-steps/workflow-actions/types/FunctionInput';
import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/utils/getWrongExportedFunctionMarkers';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import styled from '@emotion/styled';
import { CodeEditor } from 'twenty-ui';

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const WorkflowEditActionFormServerlessFunctionForm = ({
  functionInput,
  path = [],
  VariablePicker,
  onInputChange,
  readonly = false,
}: {
  functionInput: FunctionInput;
  path?: string[];
  VariablePicker?: VariablePickerComponent;
  onInputChange: (value: any, path: string[]) => void;
  readonly?: boolean;
}) => {
  return (
    <>
      <WorkflowEditActionFormServerlessFunctionFields
        functionInput={functionInput}
        VariablePicker={WorkflowVariablePicker}
        onInputChange={handleInputChange}
        readonly={actionOptions.readonly}
      />
      <StyledCodeEditorContainer>
        <CodeEditor
          height={343}
          value={formValues.code?.[INDEX_FILE_PATH]}
          language={'typescript'}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          setMarkers={getWrongExportedFunctionMarkers}
          options={{
            readOnly: actionOptions.readonly,
            domReadOnly: actionOptions.readonly,
          }}
        />
      </StyledCodeEditorContainer>
    </>
  );
};
