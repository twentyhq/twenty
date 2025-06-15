import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { gql, useQuery } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import { MessageChannelVisibility } from '~/generated-metadata/graphql';

const GET_CONNECTED_ACCOUNT = gql`
  query GetConnectedAccount($id: ID!) {
    connectedAccount(id: $id) {
      id
      handle
      provider
      connectionType
      accessToken
      refreshToken
      accountOwnerId
      authFailedAt
      customConnectionParams
      messageChannels {
        edges {
          node {
            id
            handle
            visibility
          }
        }
      }
    }
  }
`;

type UseConnectedAccountProps = {
  connectedAccountId: string | undefined;
  skip?: boolean;
};

type ConnectionParams = {
  host: string;
  port: number;
  secure: boolean;
  messageVisibility: MessageChannelVisibility;
};

type UseConnectedAccountReturn = {
  connectedAccount?: ConnectedAccount;
  loading: boolean;
  error?: Error;
  connectionParams?: ConnectionParams;
};

export const useConnectedAccount = ({
  connectedAccountId,
  skip = false,
}: UseConnectedAccountProps): UseConnectedAccountReturn => {
  const { data, loading, error } = useQuery(GET_CONNECTED_ACCOUNT, {
    variables: {
      id: connectedAccountId,
    },
    skip: !connectedAccountId || skip,
  });

  const connectedAccount = data?.connectedAccount;

  const connectionParams = isDefined(connectedAccount?.customConnectionParams)
    ? {
        host: connectedAccount.customConnectionParams.host as string,
        port: connectedAccount.customConnectionParams.port as number,
        secure: connectedAccount.customConnectionParams.secure as boolean,
        messageVisibility: (connectedAccount.messageChannels?.edges?.[0]?.node
          ?.visibility ||
          MessageChannelVisibility.SHARE_EVERYTHING) as MessageChannelVisibility,
      }
    : undefined;

  return {
    connectedAccount,
    loading,
    error,
    connectionParams,
  };
};
