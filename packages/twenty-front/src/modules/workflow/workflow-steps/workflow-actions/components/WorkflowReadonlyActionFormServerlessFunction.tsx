import { useGetAvailablePackages } from '@/settings/serverless-functions/hooks/useGetAvailablePackages';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { WorkflowCodeAction } from '@/workflow/types/Workflow';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';

import { INDEX_FILE_PATH } from '@/serverless-functions/constants/IndexFilePath';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowEditActionFormServerlessFunctionFields } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionFormServerlessFunctionFields';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/utils/getWrongExportedFunctionMarkers';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { isDefined } from 'twenty-shared';
import { CodeEditor, useIcons } from 'twenty-ui';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type WorkflowReadonlyActionFormServerlessFunctionProps = {
  action: WorkflowCodeAction;
};

export const WorkflowReadonlyActionFormServerlessFunction = ({
  action,
}: WorkflowReadonlyActionFormServerlessFunctionProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const serverlessFunctionId = action.settings.input.serverlessFunctionId;
  const serverlessFunctionVersion =
    action.settings.input.serverlessFunctionVersion;

  const { availablePackages } = useGetAvailablePackages({
    id: serverlessFunctionId,
  });

  const { formValues, loading } = useServerlessFunctionUpdateFormState({
    serverlessFunctionId,
    serverlessFunctionVersion,
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

  const headerTitle = isDefined(action.name)
    ? action.name
    : 'Code - Serverless Function';
  const headerIcon = getActionIcon(action.type);

  if (loading) {
    return null;
  }

  return (
    <StyledContainer>
      <WorkflowStepHeader
        Icon={getIcon(headerIcon)}
        iconColor={theme.color.orange}
        initialTitle={headerTitle}
        headerType="Code"
        disabled
      />
      <WorkflowStepBody>
        <WorkflowEditActionFormServerlessFunctionFields
          functionInput={action.settings.input.serverlessFunctionInput}
          readonly
        />
        <StyledCodeEditorContainer>
          <CodeEditor
            height={343}
            value={formValues.code?.[INDEX_FILE_PATH]}
            language={'typescript'}
            onMount={handleEditorDidMount}
            setMarkers={getWrongExportedFunctionMarkers}
            options={{
              readOnly: true,
              domReadOnly: true,
            }}
          />
        </StyledCodeEditorContainer>
      </WorkflowStepBody>
    </StyledContainer>
  );
};
