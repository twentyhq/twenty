import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { GetAgentDocument, UpdateAgentDocument } from '~/generated/graphql';

type AgentFormValues = {
  name: string;
  prompt: string;
  model: string;
  responseFormat: string;
};

export const useAgentUpdateFormState = ({ agentId }: { agentId: string }) => {
  const [formValues, setFormValues] = useState<AgentFormValues>({
    name: '',
    prompt: '',
    model: '',
    responseFormat: '',
  });

  const { loading } = useQuery(GetAgentDocument, {
    variables: { id: agentId },
    skip: !agentId,
    onCompleted: (data) => {
      if (isDefined(data?.findOneAgent)) {
        const agent = data.findOneAgent;
        setFormValues({
          name: agent.name,
          prompt: agent.prompt,
          model: agent.model,
          responseFormat: agent.responseFormat,
        });
      }
    },
  });

  const [updateAgent] = useMutation(UpdateAgentDocument);

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

  return {
    formValues,
    setFormValues,
    updateAgent: updateAgentMutation,
    loading,
  };
};
