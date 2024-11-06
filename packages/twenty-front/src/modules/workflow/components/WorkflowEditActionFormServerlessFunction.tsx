import { useGetManyServerlessFunctions } from '@/settings/serverless-functions/hooks/useGetManyServerlessFunctions';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowEditGenericFormBase } from '@/workflow/components/WorkflowEditGenericFormBase';
import VariableTagInput from '@/workflow/search-variables/components/VariableTagInput';
import { WorkflowCodeStep } from '@/workflow/types/Workflow';
import { useTheme } from '@emotion/react';
import { useState } from 'react';
import { IconCode, isDefined } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';
import { capitalize } from '~/utils/string/capitalize';

type WorkflowEditActionFormServerlessFunctionProps =
  | {
      action: WorkflowCodeStep;
      readonly: true;
    }
  | {
      action: WorkflowCodeStep;
      readonly?: false;
      onActionUpdate: (action: WorkflowCodeStep) => void;
    };

export const WorkflowEditActionFormServerlessFunction = (
  props: WorkflowEditActionFormServerlessFunctionProps,
) => {
  const theme = useTheme();

  const { serverlessFunctions } = useGetManyServerlessFunctions();

  const defaultFunctionInput =
    props.action.settings.input.serverlessFunctionInput;

  const [functionInput, setFunctionInput] =
    useState<Record<string, any>>(defaultFunctionInput);

  const [serverlessFunctionId, setServerlessFunctionId] = useState<string>(
    props.action.settings.input.serverlessFunctionId,
  );

  const updateFunctionInput = useDebouncedCallback(
    async (newFunctionInput: object) => {
      if (props.readonly === true) {
        return;
      }

      props.onActionUpdate({
        ...props.action,
        settings: {
          ...props.action.settings,
          input: {
            serverlessFunctionId:
              props.action.settings.input.serverlessFunctionId,
            serverlessFunctionVersion:
              props.action.settings.input.serverlessFunctionVersion,
            serverlessFunctionInput: {
              ...props.action.settings.input.serverlessFunctionInput,
              ...newFunctionInput,
            },
          },
        },
      });
    },
    1_000,
  );

  const handleInputChange = (key: string, value: any) => {
    const newFunctionInput = { ...functionInput, [key]: value };
    setFunctionInput(newFunctionInput);
    updateFunctionInput(newFunctionInput);
  };

  const availableFunctions: Array<SelectOption<string>> = [
    { label: 'None', value: '' },
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
    setServerlessFunctionId(newServerlessFunctionId);

    const serverlessFunction = serverlessFunctions.find(
      (f) => f.id === newServerlessFunctionId,
    );

    const serverlessFunctionVersion =
      serverlessFunction?.latestVersion || 'latest';

    const defaultFunctionInput = serverlessFunction?.latestVersionInputSchema
      ? serverlessFunction.latestVersionInputSchema
          .map((parameter) => parameter.name)
          .reduce((acc, name) => ({ ...acc, [name]: null }), {})
      : {};

    if (!props.readonly) {
      props.onActionUpdate({
        ...props.action,
        settings: {
          ...props.action.settings,
          input: {
            serverlessFunctionId: newServerlessFunctionId,
            serverlessFunctionVersion,
            serverlessFunctionInput: defaultFunctionInput,
          },
        },
      });
    }

    setFunctionInput(defaultFunctionInput);
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
        value={serverlessFunctionId}
        options={availableFunctions}
        disabled={props.readonly}
        onChange={handleFunctionChange}
      />
      {functionInput &&
        Object.entries(functionInput).map(([inputKey, inputValue]) => (
          <VariableTagInput
            inputId={`input-${inputKey}`}
            label={capitalize(inputKey)}
            placeholder="Enter value (use {{variable}} for dynamic content)"
            value={inputValue ?? ''}
            onChange={(value) => handleInputChange(inputKey, value)}
          />
        ))}
    </WorkflowEditGenericFormBase>
  );
};
