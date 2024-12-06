import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { useGetAvailablePackages } from '@/settings/serverless-functions/hooks/useGetAvailablePackages';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { useUpdateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useUpdateOneServerlessFunction';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { WorkflowStepHeader } from '@/workflow/components/WorkflowStepHeader';
import { WorkflowVariablePicker } from '@/workflow/components/WorkflowVariablePicker';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { FunctionInput } from '@/workflow/types/FunctionInput';
import { WorkflowCodeAction } from '@/workflow/types/Workflow';
import { getDefaultFunctionInputFromInputSchema } from '@/workflow/utils/getDefaultFunctionInputFromInputSchema';
import { getFunctionInputSchema } from '@/workflow/utils/getFunctionInputSchema';
import { setNestedValue } from '@/workflow/utils/setNestedValue';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/workflow-actions/utils/mergeDefaultFunctionInputAndFunctionInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { Fragment, ReactNode, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { CodeEditor, IconCode, isDefined, IconPlayerPlay } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';
import { usePreventOverlapCallback } from '~/hooks/usePreventOverlapCallback';
import { WorkflowStepBody } from '@/workflow/components/WorkflowStepBody';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';

const StyledContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
`;

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-top: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
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

const INDEX_FILE_PATH = 'src/index.ts';

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
  const workflowId = useRecoilValue(workflowIdState);
  const workflow = useWorkflowWithCurrentVersion(workflowId);
  const { availablePackages } = useGetAvailablePackages({
    id: serverlessFunctionId,
  });

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
    const functionInputSchema = getFunctionInputSchema(sourceCode);
    const newMergedInputSchema = mergeDefaultFunctionInputAndFunctionInput({
      defaultFunctionInput:
        getDefaultFunctionInputFromInputSchema(functionInputSchema),
      functionInput: action.settings.input.serverlessFunctionInput,
    });

    setFunctionInput(newMergedInputSchema);
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

  const renderFields = ({
    functionInput,
    path = [],
    isRoot = true,
  }: {
    functionInput: FunctionInput;
    path?: string[];
    isRoot?: boolean;
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
              })}
            </Fragment>
          );
        }
        return (
          <StyledContainer key={pathKey}>
            <StyledLabel>{inputKey}</StyledLabel>
            <StyledInputContainer>
              {renderFields({
                functionInput: inputValue,
                path: currentPath,
                isRoot: false,
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
            onPersist={(value) => handleInputChange(value, currentPath)}
            VariablePicker={WorkflowVariablePicker}
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
              {renderFields({ functionInput })}
              <CodeEditor
                height={340}
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
            </>
          )}
          {activeTabId === 'test' && <>{renderFields({ functionInput })}</>}
        </WorkflowStepBody>
      </>
    )
  );
};
