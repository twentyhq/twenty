import { WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { useCallback, useEffect, useState } from 'react';
import { SelectOption } from 'twenty-ui/input';
import { useDebouncedCallback } from 'use-debounce';
import { RESPONSE_FORMATS } from '../constants/AIAgent';

type AiAgentFormData = {
  modelProvider: string;
  model: string;
  prompt: string;
  responseFormat: string;
};

type AiAgentFormErrors = {
  modelProvider?: string;
  model?: string;
  prompt?: string;
  responseFormat?: string;
};

type UseAiAgentFormProps = {
  action: WorkflowAiAgentAction;
  onActionUpdate?: (action: WorkflowAiAgentAction) => void;
  readonly?: boolean;
};

export const useAiAgentForm = ({
  action,
  onActionUpdate,
  readonly = false,
}: UseAiAgentFormProps) => {
  const [formData, setFormData] = useState<AiAgentFormData>({
    modelProvider: action.settings.input.modelProvider,
    model: action.settings.input.model,
    prompt: action.settings.input.prompt,
    responseFormat: action.settings.input.responseFormat,
  });

  const [errorMessages, setErrorMessages] = useState<AiAgentFormErrors>({});
  const [errorMessagesVisible, setErrorMessagesVisible] =
    useState<AiAgentFormErrors>({});

  const validateField = useCallback(
    (field: keyof AiAgentFormData, value: any): string | undefined => {
      switch (field) {
        case 'modelProvider':
          return !value ? 'Model provider is required' : undefined;
        case 'model':
          return !value ? 'Model is required' : undefined;
        case 'prompt':
          return !value ? 'Prompt is required' : undefined;
        case 'responseFormat':
          {
            if (!value) {
              return 'Response format is required';
            }
            const allowedValues = RESPONSE_FORMATS.map(
              (opt: SelectOption<string>) => opt.value,
            );
            if (!allowedValues.includes(value))
              return (
                'Response format must be one of: ' + allowedValues.join(', ')
              );
          }
          return undefined;
        default:
          return undefined;
      }
    },
    [],
  );

  const handleFieldChange = useCallback(
    (field: keyof AiAgentFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      const error = validateField(field, value);
      setErrorMessages((prev) => ({ ...prev, [field]: error }));
      setErrorMessagesVisible((prev) => ({ ...prev, [field]: error }));
    },
    [validateField],
  );

  const onBlur = useCallback(
    (field: keyof AiAgentFormData) => {
      const error = validateField(field, formData[field]);
      setErrorMessages((prev) => ({ ...prev, [field]: error }));
      setErrorMessagesVisible((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField],
  );

  const saveAction = useDebouncedCallback(
    () => {
      if (readonly || !onActionUpdate) {
        return;
      }

      const hasErrors = Object.values(errorMessages).some(
        (error) => error !== undefined,
      );
      if (hasErrors) {
        return;
      }

      onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            ...action.settings.input,
            ...formData,
          },
        },
      });
    },
    1000,
    { maxWait: 5000 },
  );

  useEffect(() => {
    saveAction();
  }, [formData, saveAction]);

  return {
    formData,
    errorMessages,
    errorMessagesVisible,
    handleFieldChange,
    onBlur,
    saveAction,
  };
};
