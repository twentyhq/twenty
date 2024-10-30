import { useGetManyServerlessFunctions } from '@/settings/serverless-functions/hooks/useGetManyServerlessFunctions';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowEditGenericFormBase } from '@/workflow/components/WorkflowEditGenericFormBase';
import VariableTagInput from '@/workflow/search-variables/components/VariableTagInput';
import { WorkflowCodeStep } from '@/workflow/types/Workflow';
import { useTheme } from '@emotion/react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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

  const form = useForm({
    disabled: props.readonly,
  });

  const defaultFunctionInput = Object.fromEntries(
    Object.entries(props.action.settings.input).filter(
      ([key, _]) =>
        key !== 'serverlessFunctionId' && key !== 'serverlessFunctionVersion',
    ),
  );

  useEffect(() => {
    form.reset();
    Object.entries(props.action.settings.input).forEach(([key, value]) => {
      form.setValue(key, value ?? '');
    });
  }, [props.action.settings.input, form]);

  const updateFunctionInput = useDebouncedCallback(async (formData: object) => {
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
          ...formData,
        },
      },
    });
  }, 1_000);

  useEffect(() => {
    return () => {
      updateFunctionInput.flush();
    };
  }, [updateFunctionInput]);

  const handleSave = () =>
    form.handleSubmit((formData: object) => updateFunctionInput(formData))();

  const availableFunctions: Array<SelectOption<string>> = [
    { label: 'None', value: '' },
    ...serverlessFunctions
      .filter((serverlessFunction) =>
        isDefined(serverlessFunction.latestVersion),
      )
      .map((serverlessFunction) => ({
        label: serverlessFunction.name,
        value: serverlessFunction.id,
        inputSchema: serverlessFunction.inputSchema,
      })),
  ];

  return (
    <WorkflowEditGenericFormBase
      HeaderIcon={<IconCode color={theme.color.orange} />}
      headerTitle="Code - Serverless Function"
      headerType="Code"
    >
      <Controller
        name="serverlessFunctionId"
        control={form.control}
        render={({ field }) => (
          <Select
            dropdownId="select-serverless-function-id"
            label="Function"
            fullWidth
            value={field.value}
            options={availableFunctions}
            disabled={props.readonly}
            onChange={(serverlessFunctionId) => {
              field.onChange(serverlessFunctionId);

              const serverlessFunction = serverlessFunctions.find(
                (f) => f.id === serverlessFunctionId,
              );

              const serverlessFunctionVersion =
                serverlessFunction?.latestVersion || 'latest';

              const defaultFunctionInput = serverlessFunction?.inputSchema
                .map((parameter) => parameter.name)
                .reduce((acc, name) => ({ ...acc, [name]: null }), {});

              form.handleSubmit(async () => {
                if (props.readonly === true) {
                  return;
                }

                props.onActionUpdate({
                  ...props.action,
                  settings: {
                    ...props.action.settings,
                    input: {
                      serverlessFunctionId,
                      serverlessFunctionVersion,
                      ...defaultFunctionInput,
                    },
                  },
                });
              })();
            }}
          />
        )}
      />
      {defaultFunctionInput &&
        Object.keys(defaultFunctionInput).map((inputKey) => (
          <Controller
            name={inputKey}
            control={form.control}
            render={({ field }) => (
              <VariableTagInput
                inputId={`input-${inputKey}`}
                label={capitalize(inputKey)}
                placeholder="Enter value (use {{variable}} for dynamic content)"
                value={field.value}
                onChange={(inputKey) => {
                  field.onChange(inputKey);
                  handleSave();
                }}
              />
            )}
          />
        ))}
    </WorkflowEditGenericFormBase>
  );
};
