import { ReactNode, Fragment } from 'react';
import styled from '@emotion/styled';
import { useGetManyServerlessFunctions } from '@/settings/serverless-functions/hooks/useGetManyServerlessFunctions';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowEditGenericFormBase } from '@/workflow/components/WorkflowEditGenericFormBase';
import VariableTagInput from '@/workflow/search-variables/components/VariableTagInput';
import { FunctionInput } from '@/workflow/types/FunctionInput';
import { WorkflowCodeAction } from '@/workflow/types/Workflow';
import { getDefaultFunctionInputFromInputSchema } from '@/workflow/utils/getDefaultFunctionInputFromInputSchema';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/utils/mergeDefaultFunctionInputAndFunctionInput';
import { setNestedValue } from '@/workflow/utils/setNestedValue';
import { useTheme } from '@emotion/react';
import { HorizontalSeparator, IconCode, isDefined } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

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

export const WorkflowEditActionFormServerlessFunction = ({
  action,
  actionOptions,
}: WorkflowEditActionFormServerlessFunctionProps) => {
  const theme = useTheme();
  const { serverlessFunctions } = useGetManyServerlessFunctions();

  const getFunctionInput = (serverlessFunctionId: string) => {
    if (!serverlessFunctionId) {
      return {};
    }

    const serverlessFunction = serverlessFunctions.find(
      (f) => f.id === serverlessFunctionId,
    );
    const inputSchema = serverlessFunction?.latestVersionInputSchema;
    const defaultFunctionInput =
      getDefaultFunctionInputFromInputSchema(inputSchema);

    const existingFunctionInput = action.settings.input.serverlessFunctionInput;

    return mergeDefaultFunctionInputAndFunctionInput({
      defaultFunctionInput,
      functionInput: existingFunctionInput,
    });
  };

  const functionInput = getFunctionInput(
    action.settings.input.serverlessFunctionId,
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
    updateFunctionInput(setNestedValue(functionInput, path, value));
  };

  const availableFunctions: Array<SelectOption<string>> = [
    ...serverlessFunctions
      .filter((serverlessFunction) =>
        isDefined(serverlessFunction.latestVersion),
      )
      .map((serverlessFunction) => ({
        label: serverlessFunction.name,
        value: serverlessFunction.id,
        latestVersionInputSchema: serverlessFunction.latestVersionInputSchema,
      })),
  ];

  const handleFunctionChange = (newServerlessFunctionId: string) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const serverlessFunction = serverlessFunctions.find(
      (f) => f.id === newServerlessFunctionId,
    );

    const newProps = {
      ...action,
      settings: {
        ...action.settings,
        input: {
          serverlessFunctionId: newServerlessFunctionId,
          serverlessFunctionVersion:
            serverlessFunction?.latestVersion || 'latest',
          serverlessFunctionInput: getFunctionInput(newServerlessFunctionId),
        },
      },
    };

    actionOptions.onActionUpdate(newProps);
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
            value={`${inputValue || ''}`}
            onChange={(value) => handleInputChange(value, currentPath)}
            readonly={actionOptions.readonly}
          />
        );
      }
    });
  };

  return (
    <WorkflowEditGenericFormBase
      HeaderIcon={<IconCode color={theme.color.orange} />}
      headerTitle="Code - Serverless Function"
      headerType="Code"
    >
      <Select
        dropdownId="select-serverless-function-id"
        label="Function"
        fullWidth
        value={action.settings.input.serverlessFunctionId}
        options={availableFunctions}
        emptyOption={{ label: 'None', value: '' }}
        disabled={actionOptions.readonly}
        onChange={handleFunctionChange}
      />
      {renderFields(functionInput)}
    </WorkflowEditGenericFormBase>
  );
};
