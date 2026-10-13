import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const IDENTIFY_APP_CONNECTION_MUTATION = `
  mutation IdentifyAppConnection($input: IdentifyAppConnectionInput!) {
    identifyAppConnection(input: $input) {
      connectedAccountId
      status
    }
  }
`;

export type IdentifyConnectionStatus =
  | 'IDENTIFIED'
  | 'MERGED_INTO_EXISTING'
  | 'ALREADY_CONNECTED'
  | 'ACCOUNT_CHANGED';

export type IdentifyConnectionResult = {
  connectedAccountId: string;
  status: IdentifyConnectionStatus;
};

export const identifyConnection = async ({
  connectedAccountId,
  externalAccountId,
  handle,
}: {
  connectedAccountId: string;
  externalAccountId: string;
  handle?: string;
}): Promise<IdentifyConnectionResult> => {
  const data = await postGraphqlRequest<
    {
      input: {
        connectedAccountId: string;
        externalAccountId: string;
        handle?: string;
      };
    },
    { identifyAppConnection: IdentifyConnectionResult }
  >({
    query: IDENTIFY_APP_CONNECTION_MUTATION,
    variables: { input: { connectedAccountId, externalAccountId, handle } },
    caller: 'identifyConnection',
  });

  return data.identifyAppConnection;
};
