import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { gql, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
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

type UseConnectedAccountReturn = {
  connectedAccount?: ConnectedAccount;
  loading: boolean;
  error?: Error;
  connectionParams?: {
    host: string;
    port: number;
    secure: boolean;
    messageVisibility: MessageChannelVisibility;
  };
};

export const useConnectedAccount = ({
  connectedAccountId,
  skip = false,
}: UseConnectedAccountProps): UseConnectedAccountReturn => {
  const [connectionParams, setConnectionParams] = useState<{
    host: string;
    port: number;
    secure: boolean;
    messageVisibility: MessageChannelVisibility;
  }>();

  const { data, loading, error } = useQuery(GET_CONNECTED_ACCOUNT, {
    variables: {
      id: connectedAccountId,
    },
    skip: !connectedAccountId || skip,
  });

  const connectedAccount = data?.connectedAccount;

  useEffect(() => {
    if (isDefined(connectedAccount?.customConnectionParams)) {
      const params = connectedAccount.customConnectionParams || {};
      const visibility =
        connectedAccount.messageChannels?.edges?.[0]?.node?.visibility ||
        MessageChannelVisibility.SHARE_EVERYTHING;

      setConnectionParams({
        host: params.host as string,
        port: params.port as number,
        secure: params.secure as boolean,
        messageVisibility: visibility as MessageChannelVisibility,
      });
    }
  }, [connectedAccount]);

  return {
    connectedAccount,
    loading,
    error,
    connectionParams,
  };
};
