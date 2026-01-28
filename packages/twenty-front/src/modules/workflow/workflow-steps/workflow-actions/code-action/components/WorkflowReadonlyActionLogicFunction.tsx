import { useGetAvailablePackages } from '@/settings/logic-functions/hooks/useGetAvailablePackages';
import { useLogicFunctionUpdateFormState } from '@/settings/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { type WorkflowCodeAction } from '@/workflow/types/Workflow';

import { INDEX_FILE_NAME } from '@/logic-functions/constants/IndexFileName';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowEditActionLogicFunctionFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionLogicFunctionFields';
import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWrongExportedFunctionMarkers';
import styled from '@emotion/styled';
import { type Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { CodeEditor } from 'twenty-ui/input';
import { SOURCE_FOLDER_NAME } from '@/logic-functions/constants/SourceFolderName';

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type WorkflowReadonlyActionLogicFunctionProps = {
  action: WorkflowCodeAction;
};

export const WorkflowReadonlyActionLogicFunction = ({
  action,
}: WorkflowReadonlyActionLogicFunctionProps) => {
  const logicFunctionId = action.settings.input.logicFunctionId;
  const logicFunctionVersion = action.settings.input.logicFunctionVersion;

  const { availablePackages } = useGetAvailablePackages({
    id: logicFunctionId,
  });

  const { formValues, loading } = useLogicFunctionUpdateFormState({
    logicFunctionId,
    logicFunctionVersion,
  });

  const handleEditorDidMount = async (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    await AutoTypings.create(editor, {
      monaco,
      preloadPackages: true,
      onlySpecifiedPackages: true,
      versions: availablePackages,
      debounceDuration: 0,
    });
  };

  if (loading) {
    return null;
  }

  const indexFileContent =
    typeof formValues.code?.[SOURCE_FOLDER_NAME] !== 'string' &&
    typeof formValues.code[SOURCE_FOLDER_NAME][INDEX_FILE_NAME] === 'string'
      ? formValues.code[SOURCE_FOLDER_NAME][INDEX_FILE_NAME]
      : '';

  return (
    <>
      <WorkflowStepBody>
        <WorkflowEditActionLogicFunctionFields
          functionInput={action.settings.input.logicFunctionInput}
          readonly
        />
        <StyledCodeEditorContainer>
          <CodeEditor
            height={343}
            value={indexFileContent}
            language="typescript"
            onMount={handleEditorDidMount}
            setMarkers={getWrongExportedFunctionMarkers}
            options={{
              readOnly: true,
              domReadOnly: true,
            }}
          />
        </StyledCodeEditorContainer>
      </WorkflowStepBody>
    </>
  );
};
