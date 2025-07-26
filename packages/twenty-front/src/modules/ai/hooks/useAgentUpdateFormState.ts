import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import {
  useFindOneAgentQuery,
  useUpdateOneAgentMutation,
} from '~/generated-metadata/graphql';

type AgentFormValues = {
  name: string;
  prompt: string;
  modelId: string;
};

export const useAgentUpdateFormState = ({
  agentId,
  readonly = false,
}: {
  agentId: string;
  readonly?: boolean;
}) => {
  const [formValues, setFormValues] = useState<AgentFormValues>({
    name: '',
    prompt: '',
    modelId: '',
  });

  const { loading } = useFindOneAgentQuery({
    variables: { id: agentId },
    skip: !agentId,
    onCompleted: (data) => {
      if (isDefined(data?.findOneAgent)) {
        const agent = data.findOneAgent;
        setFormValues({
          name: agent.name,
          prompt: agent.prompt,
          modelId: agent.modelId,
        });
      }
    },
  });

  const [updateAgent] = useUpdateOneAgentMutation();

  const updateAgentMutation = async (updates: AgentFormValues) => {
    if (!agentId) {
      return;
    }

    await updateAgent({
      variables: {
        input: {
          id: agentId,
          ...updates,
        },
      },
    });
  };

  const handleSave = useDebouncedCallback(async (formData: AgentFormValues) => {
    await updateAgentMutation({
      name: formData.name,
      prompt: formData.prompt,
      modelId: formData.modelId,
    });
  }, 500);

  const handleFieldChange = async (field: string, value: string) => {
    if (readonly) {
      return;
    }

    setFormValues((prev) => ({ ...prev, [field]: value }));

    await handleSave({ ...formValues, [field]: value });
  };

  return {
    formValues,
    handleFieldChange,
    loading,
  };
};
