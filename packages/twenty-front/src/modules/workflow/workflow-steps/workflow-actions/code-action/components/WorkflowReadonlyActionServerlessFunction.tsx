import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { useGetAvailablePackages } from '@/settings/serverless-functions/hooks/useGetAvailablePackages';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { type WorkflowCodeAction } from '@/workflow/types/Workflow';

import { INDEX_FILE_NAME } from '@/serverless-functions/constants/IndexFileName';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowEditActionServerlessFunctionFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionServerlessFunctionFields';
import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWrongExportedFunctionMarkers';
import { useActionHeaderTypeOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionHeaderTypeOrThrow';
import { useActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionIconColorOrThrow';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import styled from '@emotion/styled';
import { type Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { CodeEditor } from 'twenty-ui/input';
import { SOURCE_FOLDER_NAME } from '@/serverless-functions/constants/SourceFolderName';

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type WorkflowReadonlyActionServerlessFunctionProps = {
  action: WorkflowCodeAction;
};

export const WorkflowReadonlyActionServerlessFunction = ({
  action,
}: WorkflowReadonlyActionServerlessFunctionProps) => {
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
  const headerIconColor = useActionIconColorOrThrow(action.type);
  const headerType = useActionHeaderTypeOrThrow(action.type);

  if (loading) {
    return null;
  }

  return (
    <>
      <SidePanelHeader
        Icon={getIcon(headerIcon)}
        iconColor={headerIconColor}
        initialTitle={headerTitle}
        headerType={headerType}
        disabled
      />
      <WorkflowStepBody>
        <WorkflowEditActionServerlessFunctionFields
          functionInput={action.settings.input.serverlessFunctionInput}
          readonly
        />
        <StyledCodeEditorContainer>
          <CodeEditor
            height={343}
            value={formValues.code?.[SOURCE_FOLDER_NAME]?.[INDEX_FILE_NAME]}
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
