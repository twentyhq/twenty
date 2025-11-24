import { isDefined } from 'twenty-shared/utils';
import {
  useFindOneAgentQuery,
  useUpdateOneAgentMutation,
} from '~/generated-metadata/graphql';

export const useUpdateAgentLabel = (agentId: string | undefined) => {
  const { data: agentData } = useFindOneAgentQuery({
    variables: { id: agentId || '' },
    skip: !isDefined(agentId),
  });

  const [updateAgent] = useUpdateOneAgentMutation();

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
