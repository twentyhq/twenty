import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { UPDATE_ONE_AGENT } from '../graphql/mutations/updateOneAgent';
import { FIND_ONE_AGENT } from '../graphql/queries/findOneAgent';

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

  const { loading } = useQuery(FIND_ONE_AGENT, {
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

  const [updateAgent] = useMutation(UPDATE_ONE_AGENT);

  const updateAgentMutation = async (updates: Partial<AgentFormValues>) => {
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
    setFormValues,
    updateAgent: updateAgentMutation,
    handleSave,
    handleFieldChange,
    loading,
  };
};
