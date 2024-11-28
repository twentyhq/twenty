import { WorkflowEditGenericFormBase } from '@/workflow/components/WorkflowEditGenericFormBase';
import VariableTagInput from '@/workflow/search-variables/components/VariableTagInput';
import { FunctionInput } from '@/workflow/types/FunctionInput';
import { WorkflowCodeAction } from '@/workflow/types/Workflow';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/utils/mergeDefaultFunctionInputAndFunctionInput';
import { setNestedValue } from '@/workflow/utils/setNestedValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Fragment, ReactNode, useState } from 'react';
import {
  CodeEditor,
  HorizontalSeparator,
  IconCode,
  isDefined,
} from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { usePreventOverlapCallback } from '~/hooks/usePreventOverlapCallback';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useUpdateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useUpdateOneServerlessFunction';
import { useGetAvailablePackages } from '@/settings/serverless-functions/hooks/useGetAvailablePackages';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { editor } from 'monaco-editor';
import { Monaco } from '@monaco-editor/react';

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

const INDEX_FILE_PATH = 'src/index.ts';

export const WorkflowEditActionFormServerlessFunction = ({
  action,
  actionOptions,
}: WorkflowEditActionFormServerlessFunctionProps) => {
  const theme = useTheme();
  const { enqueueSnackBar } = useSnackBar();
  const { updateOneServerlessFunction } = useUpdateOneServerlessFunction();
  const serverlessFunctionId = action.settings.input.serverlessFunctionId;
  const { availablePackages } = useGetAvailablePackages({
    id: serverlessFunctionId,
  });

  const { formValues, setFormValues, loading } =
    useServerlessFunctionUpdateFormState(serverlessFunctionId);

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
    setFormValues((prevState) => ({
      ...prevState,
      code: { ...prevState.code, [INDEX_FILE_PATH]: value },
    }));
    await handleSave();
  };

  const [functionInput, setFunctionInput] =
    useState<ServerlessFunctionInputFormData>(
      mergeDefaultFunctionInputAndFunctionInput({
        defaultFunctionInput: {},
        functionInput: action.settings.input.serverlessFunctionInput,
      }),
    );

  const updateFunctionInput = useDebouncedCallback(
    async (newFunctionInput: object) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            ...action.settings.input,
            serverlessFunctionInput: newFunctionInput,
          },
        },
      });
    },
    1_000,
  );

  const handleInputChange = async (value: any, path: string[]) => {
    const updatedFunctionInput = setNestedValue(functionInput, path, value);

    setFunctionInput(updatedFunctionInput);

    await updateFunctionInput(updatedFunctionInput);
  };

  const renderFields = (
    functionInput: FunctionInput,
    path: string[] = [],
    isRoot = true,
  ): ReactNode[] => {
    const displaySeparator = (functionInput: FunctionInput) => {
      const keys = Object.keys(functionInput);
      if (keys.length > 1) {
        return true;
      }
      if (keys.length === 1) {
        const subKeys = Object.keys(functionInput[keys[0]]);
        return subKeys.length > 0;
      }
      return false;
    };

    return Object.entries(functionInput).map(([inputKey, inputValue]) => {
      const currentPath = [...path, inputKey];
      const pathKey = currentPath.join('.');

      if (inputValue !== null && typeof inputValue === 'object') {
        if (isRoot) {
          return (
            <Fragment key={pathKey}>
              {displaySeparator(functionInput) && (
                <HorizontalSeparator noMargin />
              )}
              {renderFields(inputValue, currentPath, false)}
            </Fragment>
          );
        }
        return (
          <StyledContainer key={pathKey}>
            <StyledLabel>{inputKey}</StyledLabel>
            <StyledInputContainer>
              {renderFields(inputValue, currentPath, false)}
            </StyledInputContainer>
          </StyledContainer>
        );
      } else {
        return (
          <VariableTagInput
            key={pathKey}
            inputId={`input-${inputKey}`}
            label={inputKey}
            placeholder="Enter value"
            readonly={actionOptions.readonly}
            value={`${inputValue || ''}`}
            onChange={(value) => handleInputChange(value, currentPath)}
          />
        );
      }
    });
  };

  const headerTitle = isDefined(action.name)
    ? action.name
    : 'Code - Serverless Function';

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

    actionOptions?.onActionUpdate({
      ...action,
      ...actionUpdate,
    });
  };

  return (
    !loading && (
      <WorkflowEditGenericFormBase
        onTitleChange={(newName: string) => {
          onActionUpdate({ name: newName });
        }}
        HeaderIcon={
          <IconCode
            color={theme.color.orange}
            stroke={theme.icon.stroke.sm}
            size={theme.icon.size.lg}
          />
        }
        headerTitle={headerTitle}
        headerType="Code"
      >
        <CodeEditor
          height={340}
          value={formValues.code?.[INDEX_FILE_PATH]}
          language={'typescript'}
          onChange={async (value) => {
            onActionUpdate({}); // Used to create a new workflow draft version if editing workflow active version
            await onCodeChange(value);
          }}
          onMount={handleEditorDidMount}
        />
        {renderFields(functionInput)}
      </WorkflowEditGenericFormBase>
    )
  );
};
