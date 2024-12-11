import { useGetAvailablePackages } from '@/settings/serverless-functions/hooks/useGetAvailablePackages';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { useUpdateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useUpdateOneServerlessFunction';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { WorkflowStepHeader } from '@/workflow/components/WorkflowStepHeader';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { WorkflowCodeAction } from '@/workflow/types/Workflow';
import { setNestedValue } from '@/workflow/utils/setNestedValue';

import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { CodeEditor, IconCode, isDefined, IconPlayerPlay } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';
import { usePreventOverlapCallback } from '~/hooks/usePreventOverlapCallback';
import { WorkflowStepBody } from '@/workflow/components/WorkflowStepBody';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { WorkflowVariablePicker } from '@/workflow/components/WorkflowVariablePicker';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/states/serverlessFunctionTestDataFamilyState';
import { ServerlessFunctionExecutionResult } from '@/serverless-functions/components/ServerlessFunctionExecutionResult';
import { INDEX_FILE_PATH } from '@/serverless-functions/constants/IndexFilePath';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { RecordShowRightDrawerActionMenu } from '@/action-menu/components/RecordShowRightDrawerActionMenu';
import { RightDrawerActionRunButton } from '@/action-menu/components/RightDrawerActionRunButton';
import { useTestServerlessFunction } from '@/serverless-functions/hooks/useTestServerlessFunction';
import { getFunctionOutputSchema } from '@/serverless-functions/utils/getFunctionOutputSchema';
import { getFunctionInputFromSourceCode } from '@/serverless-functions/utils/getFunctionInputFromSourceCode';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/serverless-functions/utils/mergeDefaultFunctionInputAndFunctionInput';
import { WorkflowEditActionFormServerlessFunctionFields } from '@/workflow/workflow-actions/components/WorkflowEditActionFormServerlessFunctionFields';

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTabList = styled(TabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

type WorkflowEditActionFormServerlessFunctionProps = {
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

const TAB_LIST_COMPONENT_ID = 'serverless-function-code-step';

export const WorkflowEditActionFormServerlessFunction = ({
  action,
  actionOptions,
}: WorkflowEditActionFormServerlessFunctionProps) => {
  const theme = useTheme();
  const { enqueueSnackBar } = useSnackBar();
  const { activeTabId, setActiveTabId } = useTabList(TAB_LIST_COMPONENT_ID);
  const { updateOneServerlessFunction } = useUpdateOneServerlessFunction();
  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();
  const serverlessFunctionId = action.settings.input.serverlessFunctionId;
  const workflowId = useRecoilValue(workflowIdState);
  const workflow = useWorkflowWithCurrentVersion(workflowId);
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
    useServerlessFunctionUpdateFormState(serverlessFunctionId);

  const updateOutputSchemaFromTestResult = async (testResult: object) => {
    if (actionOptions.readonly === true) {
      return;
    }
    const newOutputSchema = getFunctionOutputSchema(testResult);
    await updateAction({
      ...action,
      settings: { ...action.settings, outputSchema: newOutputSchema },
    });
  };

  const { testServerlessFunction } = useTestServerlessFunction(
    serverlessFunctionId,
    updateOutputSchemaFromTestResult,
  );

  const handleSave = usePreventOverlapCallback(async () => {
    try {
      await updateOneServerlessFunction({
        id: serverlessFunctionId,
        name: formValues.name,
        description: formValues.description,
        code: formValues.code,
      });
    } catch (err) {
      enqueueSnackBar(
        (err as Error)?.message || 'An error occurred while updating function',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
  }, 1_000);

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

  const handleUpdateFunctionInputSchema = async (sourceCode: string) => {
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

    await updateAction({
      ...action,
      settings: {
        ...action.settings,
        outputSchema: {},
        input: {
          ...action.settings.input,
          serverlessFunctionInput: newMergedInput,
        },
      },
    });
  };

  const handleInputChange = async (value: any, path: string[]) => {
    const updatedFunctionInput = setNestedValue(functionInput, path, value);

    setFunctionInput(updatedFunctionInput);

    await updateAction({
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
    setActiveTabId('test');
    await testServerlessFunction();
  };

  const handleEditorDidMount = async (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      handleRunFunction,
    );
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

      actionOptions?.onActionUpdate({
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
    { id: 'code', title: 'Code', Icon: IconCode },
    { id: 'test', title: 'Test', Icon: IconPlayerPlay },
  ];

  useEffect(() => {
    setFunctionInput(action.settings.input.serverlessFunctionInput);
  }, [action]);

  return (
    !loading && (
      <>
        <StyledTabList
          tabListInstanceId={TAB_LIST_COMPONENT_ID}
          tabs={tabs}
          behaveAsLinks={false}
        />
        <WorkflowStepHeader
          onTitleChange={(newName: string) => {
            updateAction({ name: newName });
          }}
          Icon={IconCode}
          iconColor={theme.color.orange}
          initialTitle={action.name || 'Code - Serverless Function'}
          headerType="Code"
        />
        <WorkflowStepBody>
          {activeTabId === 'code' && (
            <>
              <WorkflowEditActionFormServerlessFunctionFields
                functionInput={functionInput}
                VariablePicker={WorkflowVariablePicker}
                onInputChange={handleInputChange}
                readonly={actionOptions.readonly}
              />
              <StyledCodeEditorContainer>
                <InputLabel>Code</InputLabel>
                <CodeEditor
                  height={343}
                  value={formValues.code?.[INDEX_FILE_PATH]}
                  language={'typescript'}
                  onChange={handleCodeChange}
                  onMount={handleEditorDidMount}
                  options={{
                    readOnly: actionOptions.readonly,
                    domReadOnly: actionOptions.readonly,
                  }}
                />
              </StyledCodeEditorContainer>
            </>
          )}
          {activeTabId === 'test' && (
            <>
              <WorkflowEditActionFormServerlessFunctionFields
                functionInput={serverlessFunctionTestData.input}
                onInputChange={handleTestInputChange}
                readonly={actionOptions.readonly}
              />
              <StyledCodeEditorContainer>
                <InputLabel>Result</InputLabel>
                <ServerlessFunctionExecutionResult
                  serverlessFunctionTestData={serverlessFunctionTestData}
                />
              </StyledCodeEditorContainer>
            </>
          )}
        </WorkflowStepBody>
        <RightDrawerFooter
          actions={[
            <RecordShowRightDrawerActionMenu />,
            <RightDrawerActionRunButton
              title="Test"
              onClick={handleRunFunction}
            />,
          ]}
        />
      </>
    )
  );
};
