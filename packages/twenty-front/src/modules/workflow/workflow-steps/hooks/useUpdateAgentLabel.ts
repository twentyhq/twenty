import { isDefined } from 'twenty-shared/utils';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  FindOneAgentDocument,
  UpdateOneAgentDocument,
} from '~/generated-metadata/graphql';

export const useUpdateAgentLabel = (agentId: string | undefined) => {
  const { data: agentData } = useQuery(FindOneAgentDocument, {
    variables: { id: agentId || '' },
    skip: !isDefined(agentId),
  });

  const [updateAgent] = useMutation(UpdateOneAgentDocument);

  const agent = agentData?.findOneAgent;

  const updateAgentLabel = async (newLabel: string) => {
    if (!isDefined(agent)) {
      return;
    }

    await updateAgent({
      variables: {
        input: {
          id: agent.id,
          label: newLabel,
        },
      },
      refetchQueries: ['FindOneAgent'],
    });
  };

  return { updateAgentLabel };
};
