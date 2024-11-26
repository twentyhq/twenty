import { WorkflowEditGenericFormBase } from '@/workflow/components/WorkflowEditGenericFormBase';
import VariableTagInput from '@/workflow/search-variables/components/VariableTagInput';
import { FunctionInput } from '@/workflow/types/FunctionInput';
import { WorkflowCodeAction } from '@/workflow/types/Workflow';
import { getDefaultFunctionInputFromInputSchema } from '@/workflow/utils/getDefaultFunctionInputFromInputSchema';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/utils/mergeDefaultFunctionInputAndFunctionInput';
import { setNestedValue } from '@/workflow/utils/setNestedValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Fragment, ReactNode, useState } from 'react';
import { HorizontalSeparator, IconCode, isDefined } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';
import { useGetOneServerlessFunction } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunction';

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

export const WorkflowEditActionFormServerlessFunction = ({
  action,
  actionOptions,
}: WorkflowEditActionFormServerlessFunctionProps) => {
  const theme = useTheme();

  const { serverlessFunction } = useGetOneServerlessFunction({
    id: action.settings.input.serverlessFunctionId,
  });

  const getFunctionInput = () => {
    const inputSchema = serverlessFunction?.latestVersionInputSchema;
    return getDefaultFunctionInputFromInputSchema(inputSchema);
  };

  const [functionInput, setFunctionInput] =
    useState<ServerlessFunctionInputFormData>(
      mergeDefaultFunctionInputAndFunctionInput({
        defaultFunctionInput: getFunctionInput(),
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

  const handleInputChange = (value: any, path: string[]) => {
    const updatedFunctionInput = setNestedValue(functionInput, path, value);

    setFunctionInput(updatedFunctionInput);

    updateFunctionInput(updatedFunctionInput);
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

  return (
    serverlessFunction && (
      <WorkflowEditGenericFormBase
        onTitleChange={(newName: string) => {
          if (actionOptions.readonly === true) {
            return;
          }

          actionOptions?.onActionUpdate({
            ...action,
            name: newName,
          });
        }}
        HeaderIcon={<IconCode color={theme.color.orange} />}
        headerTitle={headerTitle}
        headerType="Code"
      >
        {renderFields(functionInput)}
      </WorkflowEditGenericFormBase>
    )
  );
};
