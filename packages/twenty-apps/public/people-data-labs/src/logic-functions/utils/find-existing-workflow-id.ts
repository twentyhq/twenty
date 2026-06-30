import { type CoreApiClient } from 'twenty-client-sdk/core';

export const findExistingWorkflowId = async ({
  client,
  name,
}: {
  client: CoreApiClient;
  name: string;
}): Promise<string | undefined> => {
  const result = (await client.query({
    workflows: {
      __args: { filter: { name: { eq: name } } },
      edges: { node: { id: true } },
    },
  })) as { workflows?: { edges?: { node?: { id?: string } }[] } };

  return result.workflows?.edges?.[0]?.node?.id;
};
