import { useGetAvailablePackages } from '@/settings/logic-functions/hooks/useGetAvailablePackages';
import { type WorkflowCodeAction } from '@/workflow/types/Workflow';
import { useGetLogicFunctionSourceCode } from '@/logic-functions/hooks/useGetLogicFunctionSourceCode';

import { INDEX_FILE_NAME } from '@/logic-functions/constants/IndexFileName';
import { SOURCE_FOLDER_NAME } from '@/logic-functions/constants/SourceFolderName';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowEditActionCodeFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCodeFields';
import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWrongExportedFunctionMarkers';
import styled from '@emotion/styled';
import { type Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { CodeEditor } from 'twenty-ui/input';

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type WorkflowReadonlyActionCodeProps = {
  action: WorkflowCodeAction;
};

export const WorkflowReadonlyActionCode = ({
  action,
}: WorkflowReadonlyActionCodeProps) => {
  const logicFunctionId = action.settings.input.logicFunctionId;

  const { availablePackages } = useGetAvailablePackages({
    id: logicFunctionId,
  });

  const { code, loading } = useGetLogicFunctionSourceCode({
    logicFunctionId,
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
    code != null &&
    typeof code?.[SOURCE_FOLDER_NAME] !== 'string' &&
    typeof code[SOURCE_FOLDER_NAME]?.[INDEX_FILE_NAME] === 'string'
      ? code[SOURCE_FOLDER_NAME][INDEX_FILE_NAME]
      : '';

  return (
    <>
      <WorkflowStepBody>
        <WorkflowEditActionCodeFields
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
