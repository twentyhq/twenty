import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const DEDUPLICATE_CONNECTED_ACCOUNT_MUTATION = `
  mutation DeduplicateConnectedAccount($input: DeduplicateAppConnectionInput!) {
    deduplicateConnectedAccount(input: $input) {
      connectedAccountId
      wasMerged
    }
  }
`;

export type DeduplicateConnectedAccountResult = {
  connectedAccountId: string;
  wasMerged: boolean;
};

export const deduplicateConnectedAccount = async ({
  connectedAccountId,
  externalAccountId,
  handle,
}: {
  connectedAccountId: string;
  externalAccountId: string;
  handle?: string;
}): Promise<DeduplicateConnectedAccountResult> => {
  const data = await postGraphqlRequest<
    {
      input: {
        connectedAccountId: string;
        externalAccountId: string;
        handle?: string;
      };
    },
    { deduplicateConnectedAccount: DeduplicateConnectedAccountResult }
  >({
    query: DEDUPLICATE_CONNECTED_ACCOUNT_MUTATION,
    variables: { input: { connectedAccountId, externalAccountId, handle } },
    caller: 'deduplicateConnectedAccount',
  });

  return data.deduplicateConnectedAccount;
};
