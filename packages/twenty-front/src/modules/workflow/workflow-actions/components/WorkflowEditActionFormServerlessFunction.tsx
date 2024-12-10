import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { useGetAvailablePackages } from '@/settings/serverless-functions/hooks/useGetAvailablePackages';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { useUpdateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useUpdateOneServerlessFunction';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { WorkflowStepHeader } from '@/workflow/components/WorkflowStepHeader';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { FunctionInput } from '@/workflow/types/FunctionInput';
import { WorkflowCodeAction } from '@/workflow/types/Workflow';
import { setNestedValue } from '@/workflow/utils/setNestedValue';

import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { Fragment, ReactNode, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { CodeEditor, IconCode, isDefined, IconPlayerPlay } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';
import { usePreventOverlapCallback } from '~/hooks/usePreventOverlapCallback';
import { WorkflowStepBody } from '@/workflow/components/WorkflowStepBody';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { WorkflowVariablePicker } from '@/workflow/components/WorkflowVariablePicker';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/states/serverlessFunctionTestDataFamilyState';
import { ServerlessFunctionExecutionResult } from '@/serverless-functions/components/ServerlessFunctionExecutionResult';
import { INDEX_FILE_PATH } from '@/serverless-functions/constants/IndexFilePath';
import { getFunctionInputFromSourceCode } from '@/serverless-functions/utils/getFunctionInputFromSourceCode';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { RecordShowRightDrawerActionMenu } from '@/action-menu/components/RecordShowRightDrawerActionMenu';
import { RightDrawerActionRunButton } from '@/action-menu/components/RightDrawerActionRunButton';
import { useTestServerlessFunction } from '@/serverless-functions/hooks/useTestServerlessFunction';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/serverless-functions/utils/mergeDefaultFunctionInputAndFunctionInput';

const StyledContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
`;

const StyledInputContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

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
        onActionUpdate: (
          action: WorkflowCodeAction,
          shouldUpdateStepOutput?: boolean,
        ) => void;
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
  const { activeTabIdState } = useTabList(TAB_LIST_COMPONENT_ID);
  const activeTabId = useRecoilValue(activeTabIdState);
  const { updateOneServerlessFunction } = useUpdateOneServerlessFunction();
  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();
  const serverlessFunctionId = action.settings.input.serverlessFunctionId;
  const { testServerlessFunction } =
    useTestServerlessFunction(serverlessFunctionId);
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

  const headerTitle = action.name || 'Code - Serverless Function';

  const save = async () => {
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
  };

  const handleSave = usePreventOverlapCallback(save, 1000);

  const onCodeChange = async (value: string) => {
    if (actionOptions.readonly === true) {
      return;
    }
    setFormValues((prevState) => ({
      ...prevState,
      code: { ...prevState.code, [INDEX_FILE_PATH]: value },
    }));
    await handleSave();
    await handleUpdateFunctionInputSchema();
  };

  const updateFunctionInputSchema = async () => {
    if (actionOptions.readonly === true) {
      return;
    }
    const sourceCode = formValues.code?.[INDEX_FILE_PATH];
    if (!isDefined(sourceCode)) {
      return;
    }
    const functionInput = getFunctionInputFromSourceCode(sourceCode);
    const newMergedInputSchema = mergeDefaultFunctionInputAndFunctionInput({
      defaultFunctionInput: functionInput,
      functionInput: action.settings.input.serverlessFunctionInput,
    });

    const newMergedTestInputSchema = mergeDefaultFunctionInputAndFunctionInput({
      defaultFunctionInput: functionInput,
      functionInput: serverlessFunctionTestData.input,
    });

    setFunctionInput(newMergedInputSchema);
    setServerlessFunctionTestData((prev) => ({
      ...prev,
      input: newMergedTestInputSchema,
    }));

    await updateFunctionInput(newMergedInputSchema);
  };

  const handleUpdateFunctionInputSchema = useDebouncedCallback(
    updateFunctionInputSchema,
    100,
  );

  const updateFunctionInput = useDebouncedCallback(
    async (newFunctionInput: object, shouldUpdateStepOutput = true) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate(
        {
          ...action,
          settings: {
            ...action.settings,
            input: {
              ...action.settings.input,
              serverlessFunctionInput: newFunctionInput,
            },
          },
        },
        shouldUpdateStepOutput,
      );
    },
    1_000,
  );

  const handleInputChange = async (value: any, path: string[]) => {
    const updatedFunctionInput = setNestedValue(functionInput, path, value);

    setFunctionInput(updatedFunctionInput);

    await updateFunctionInput(updatedFunctionInput, false);
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

  const renderFields = ({
    functionInput,
    path = [],
    isRoot = true,
    VariablePicker,
    onInputChange,
  }: {
    functionInput: FunctionInput;
    path?: string[];
    isRoot?: boolean;
    VariablePicker?: VariablePickerComponent;
    onInputChange: (value: any, path: string[]) => void;
  }): ReactNode[] => {
    return Object.entries(functionInput).map(([inputKey, inputValue]) => {
      const currentPath = [...path, inputKey];
      const pathKey = currentPath.join('.');

      if (inputValue !== null && typeof inputValue === 'object') {
        if (isRoot) {
          return (
            <Fragment key={pathKey}>
              {renderFields({
                functionInput: inputValue,
                path: currentPath,
                isRoot: false,
                VariablePicker,
                onInputChange,
              })}
            </Fragment>
          );
        }
        return (
          <StyledContainer key={pathKey}>
            <InputLabel>{inputKey}</InputLabel>
            <StyledInputContainer>
              {renderFields({
                functionInput: inputValue,
                path: currentPath,
                isRoot: false,
                VariablePicker,
                onInputChange,
              })}
            </StyledInputContainer>
          </StyledContainer>
        );
      } else {
        return (
          <FormTextFieldInput
            key={pathKey}
            label={inputKey}
            placeholder="Enter value"
            defaultValue={inputValue ? `${inputValue}` : ''}
            readonly={actionOptions.readonly}
            onPersist={(value) => onInputChange(value, currentPath)}
            VariablePicker={VariablePicker}
          />
        );
      }
    });
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

  const onActionUpdate = (actionUpdate: Partial<WorkflowCodeAction>) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions?.onActionUpdate(
      {
        ...action,
        ...actionUpdate,
      },
      false,
    );
  };

  const checkWorkflowUpdatable = async () => {
    if (actionOptions.readonly === true || !isDefined(workflow)) {
      return;
    }
    await getUpdatableWorkflowVersion(workflow);
  };

  const tabs = [
    {
      id: 'code',
      title: 'Code',
      Icon: IconCode,
    },
    { id: 'test', title: 'Test', Icon: IconPlayerPlay },
  ];

  useEffect(() => {
    setFunctionInput(action.settings.input.serverlessFunctionInput);
  }, [action]);

  return (
    !loading && (
      <>
        <StyledTabList tabListInstanceId={TAB_LIST_COMPONENT_ID} tabs={tabs} />
        <WorkflowStepHeader
          onTitleChange={(newName: string) => {
            onActionUpdate({ name: newName });
          }}
          Icon={IconCode}
          iconColor={theme.color.orange}
          initialTitle={headerTitle}
          headerType="Code"
        />
        <WorkflowStepBody>
          {activeTabId === 'code' && (
            <>
              {renderFields({
                functionInput,
                VariablePicker: WorkflowVariablePicker,
                onInputChange: handleInputChange,
              })}
              <StyledCodeEditorContainer>
                <InputLabel>Code</InputLabel>
                <CodeEditor
                  height={343}
                  value={formValues.code?.[INDEX_FILE_PATH]}
                  language={'typescript'}
                  onChange={async (value) => {
                    await checkWorkflowUpdatable();
                    await onCodeChange(value);
                  }}
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
              {renderFields({
                functionInput: serverlessFunctionTestData.input,
                onInputChange: handleTestInputChange,
              })}
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
            ...(activeTabId === 'test'
              ? [
                  <RightDrawerActionRunButton
                    title="Test"
                    onClick={testServerlessFunction}
                  />,
                ]
              : []),
          ]}
        />
      </>
    )
  );
};
