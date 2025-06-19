import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { UPDATE_ONE_AGENT } from '../graphql/mutations/updateOneAgent';
import { FIND_ONE_AGENT } from '../graphql/queries/findOneAgent';

type AgentFormValues = {
  name: string;
  prompt: string;
  modelId: string;
  responseFormat: string;
};

export const useAgentUpdateFormState = ({ agentId }: { agentId: string }) => {
  const [formValues, setFormValues] = useState<AgentFormValues>({
    name: '',
    prompt: '',
    modelId: '',
    responseFormat: '',
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
          responseFormat: JSON.stringify(agent.responseFormat, null, 2),
        });
      }
    },
  });

  const [updateAgent] = useMutation(UPDATE_ONE_AGENT);

  const updateAgentMutation = async (updates: Partial<AgentFormValues>) => {
    if (!agentId) {
      return;
    }

    const apiUpdates = { ...updates };
    if (updates.responseFormat !== undefined) {
      try {
        apiUpdates.responseFormat = JSON.parse(updates.responseFormat);
      } catch (error) {
        delete apiUpdates.responseFormat;
      }
    }

    await updateAgent({
      variables: {
        input: {
          id: agentId,
          ...apiUpdates,
        },
      },
    });
  };

  return {
    formValues,
    setFormValues,
    updateAgent: updateAgentMutation,
    loading,
  };
};
