import { useGetAvailablePackages } from '@/settings/serverless-functions/hooks/useGetAvailablePackages';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { useUpdateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useUpdateOneServerlessFunction';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowCodeAction } from '@/workflow/types/Workflow';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { setNestedValue } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/setNestedValue';

import { CmdEnterActionButton } from '@/action-menu/components/CmdEnterActionButton';
import { ServerlessFunctionExecutionResult } from '@/serverless-functions/components/ServerlessFunctionExecutionResult';
import { INDEX_FILE_PATH } from '@/serverless-functions/constants/IndexFilePath';
import { useTestServerlessFunction } from '@/serverless-functions/hooks/useTestServerlessFunction';
import { getFunctionInputFromSourceCode } from '@/serverless-functions/utils/getFunctionInputFromSourceCode';
import { getFunctionOutputSchema } from '@/serverless-functions/utils/getFunctionOutputSchema';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/serverless-functions/utils/mergeDefaultFunctionInputAndFunctionInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { TextArea } from '@/ui/input/components/TextArea';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/states/serverlessFunctionTestDataFamilyState';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowEditActionServerlessFunctionFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionServerlessFunctionFields';
import { WORKFLOW_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/code-action/constants/WorkflowServerlessFunctionTabListComponentId';
import { WorkflowServerlessFunctionTabId } from '@/workflow/workflow-steps/workflow-actions/code-action/types/WorkflowServerlessFunctionTabId';
import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWrongExportedFunctionMarkers';
import { useActionHeaderTypeOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionHeaderTypeOrThrow';
import { useActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionIconColorOrThrow';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import styled from '@emotion/styled';
import { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconCode, IconPlayerPlay, useIcons } from 'twenty-ui/display';
import { CodeEditor } from 'twenty-ui/input';
import { useDebouncedCallback } from 'use-debounce';

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTabList = styled(TabList)`
  background-color: ${({ theme }) => theme.background.secondary};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

type WorkflowEditActionServerlessFunctionProps = {
  action: WorkflowCodeAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowCodeAction) => void;
      };
};

type ServerlessFunctionInputFormData = {
  [field: string]: string | ServerlessFunctionInputFormData;
};

export const WorkflowEditActionServerlessFunction = ({
  action,
  actionOptions,
}: WorkflowEditActionServerlessFunctionProps) => {
  const { getIcon } = useIcons();
  const serverlessFunctionId = action.settings.input.serverlessFunctionId;
  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    WORKFLOW_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID,
  );
  const { updateOneServerlessFunction } =
    useUpdateOneServerlessFunction(serverlessFunctionId);
  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);
  const { availablePackages } = useGetAvailablePackages({
    id: serverlessFunctionId,
  });

  const [serverlessFunctionTestData, setServerlessFunctionTestData] =
    useRecoilState(serverlessFunctionTestDataFamilyState(serverlessFunctionId));

  const [functionInput, setFunctionInput] =
    useState<ServerlessFunctionInputFormData>(
      action.settings.input.serverlessFunctionInput,
    );

  const { formValues, setFormValues, loading } =
    useServerlessFunctionUpdateFormState({
      serverlessFunctionId,
      serverlessFunctionVersion: 'draft',
    });

  const updateOutputSchemaFromTestResult = async (testResult: object) => {
    if (actionOptions.readonly === true) {
      return;
    }
    const newOutputSchema = getFunctionOutputSchema(testResult);
    updateAction({
      ...action,
      settings: { ...action.settings, outputSchema: newOutputSchema },
    });
  };

  const { testServerlessFunction, isTesting } = useTestServerlessFunction({
    serverlessFunctionId,
    callback: updateOutputSchemaFromTestResult,
  });

  const handleSave = useDebouncedCallback(async () => {
    await updateOneServerlessFunction({
      name: formValues.name,
      description: formValues.description,
      code: formValues.code,
    });
  }, 500);

  const onCodeChange = async (newCode: string) => {
    if (actionOptions.readonly === true) {
      return;
    }
    setFormValues((prevState) => ({
      ...prevState,
      code: { ...prevState.code, [INDEX_FILE_PATH]: newCode },
    }));
    await handleSave();
    await handleUpdateFunctionInputSchema(newCode);
  };

  const handleUpdateFunctionInputSchema = useDebouncedCallback(
    async (sourceCode: string) => {
      if (actionOptions.readonly === true) {
        return;
      }

      if (!isDefined(sourceCode)) {
        return;
      }

      const newFunctionInput = getFunctionInputFromSourceCode(sourceCode);
      const newMergedInput = mergeDefaultFunctionInputAndFunctionInput({
        newInput: newFunctionInput,
        oldInput: action.settings.input.serverlessFunctionInput,
      });
      const newMergedTestInput = mergeDefaultFunctionInputAndFunctionInput({
        newInput: newFunctionInput,
        oldInput: serverlessFunctionTestData.input,
      });

      setFunctionInput(newMergedInput);
      setServerlessFunctionTestData((prev) => ({
        ...prev,
        input: newMergedTestInput,
      }));

      updateAction({
        ...action,
        settings: {
          ...action.settings,
          outputSchema: {
            link: {
              isLeaf: true,
              icon: 'IconVariable',
              tab: 'test',
              label: 'Generate Function Output',
            },
            _outputSchemaType: 'LINK',
          },
          input: {
            ...action.settings.input,
            serverlessFunctionInput: newMergedInput,
          },
        },
      });
    },
    500,
  );

  const handleInputChange = async (value: any, path: string[]) => {
    const updatedFunctionInput = setNestedValue(functionInput, path, value);

    setFunctionInput(updatedFunctionInput);

    updateAction({
      ...action,
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          serverlessFunctionInput: updatedFunctionInput,
        },
      },
    });
  };

  const handleTestInputChange = async (value: any, path: string[]) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const updatedTestFunctionInput = setNestedValue(
      serverlessFunctionTestData.input,
      path,
      value,
    );
    setServerlessFunctionTestData((prev) => ({
      ...prev,
      input: updatedTestFunctionInput,
    }));
  };

  const handleRunFunction = async () => {
    if (actionOptions.readonly === true) {
      return;
    }

    if (!isTesting) {
      await testServerlessFunction();
    }
  };

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

  const updateAction = useDebouncedCallback(
    (actionUpdate: Partial<WorkflowCodeAction>) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate({
        ...action,
        ...actionUpdate,
      });
    },
    500,
  );

  const handleCodeChange = async (value: string) => {
    if (actionOptions.readonly === true || !isDefined(workflow)) {
      return;
    }
    await getUpdatableWorkflowVersion(workflow);
    await onCodeChange(value);
  };

  const tabs = [
    { id: WorkflowServerlessFunctionTabId.CODE, title: 'Code', Icon: IconCode },
    {
      id: WorkflowServerlessFunctionTabId.TEST,
      title: 'Test',
      Icon: IconPlayerPlay,
    },
  ];

  useEffect(() => {
    setFunctionInput(action.settings.input.serverlessFunctionInput);
  }, [action]);

  const headerTitle = isDefined(action.name)
    ? action.name
    : 'Code - Serverless Function';
  const headerIcon = getActionIcon(action.type);
  const headerIconColor = useActionIconColorOrThrow(action.type);
  const headerType = useActionHeaderTypeOrThrow(action.type);

  return (
    !loading && (
      <>
        <StyledTabList
          tabs={tabs}
          behaveAsLinks={false}
          componentInstanceId={
            WORKFLOW_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID
          }
        />
        <WorkflowStepHeader
          onTitleChange={(newName: string) => {
            updateAction({ name: newName });
          }}
          Icon={getIcon(headerIcon)}
          iconColor={headerIconColor}
          initialTitle={headerTitle}
          headerType={headerType}
          disabled={actionOptions.readonly}
        />
        <WorkflowStepBody>
          {activeTabId === WorkflowServerlessFunctionTabId.CODE && (
            <>
              <WorkflowEditActionServerlessFunctionFields
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
          )}
          {activeTabId === WorkflowServerlessFunctionTabId.TEST && (
            <>
              <WorkflowEditActionServerlessFunctionFields
                functionInput={serverlessFunctionTestData.input}
                onInputChange={handleTestInputChange}
                readonly={actionOptions.readonly}
              />
              <StyledCodeEditorContainer>
                <InputLabel>Result</InputLabel>
                <ServerlessFunctionExecutionResult
                  serverlessFunctionTestData={serverlessFunctionTestData}
                  isTesting={isTesting}
                />
              </StyledCodeEditorContainer>
              {serverlessFunctionTestData.output.logs.length > 0 && (
                <StyledCodeEditorContainer>
                  <InputLabel>Logs</InputLabel>
                  <TextArea
                    value={
                      isTesting ? '' : serverlessFunctionTestData.output.logs
                    }
                    maxRows={20}
                    disabled
                  />
                </StyledCodeEditorContainer>
              )}
            </>
          )}
        </WorkflowStepBody>
        {activeTabId === WorkflowServerlessFunctionTabId.TEST && (
          <RightDrawerFooter
            actions={[
              <CmdEnterActionButton
                title="Test"
                onClick={handleRunFunction}
                disabled={isTesting || actionOptions.readonly}
              />,
            ]}
          />
        )}
      </>
    )
  );
};
