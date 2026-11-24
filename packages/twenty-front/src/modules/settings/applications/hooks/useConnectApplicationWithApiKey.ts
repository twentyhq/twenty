import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { ConnectApplicationWithApiKeyDocument } from '~/generated-metadata/graphql';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

export const useConnectApplicationWithApiKey = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectApplicationWithApiKeyMutation, { loading }] = useMutation(
    ConnectApplicationWithApiKeyDocument,
  );

  const connectApplicationWithApiKey = async ({
    applicationId,
    connectionProviderName,
    connectionProviderDisplayName,
    apiKey,
    reconnectingConnectedAccountId,
  }: {
    applicationId: string;
    connectionProviderName: string;
    connectionProviderDisplayName: string;
    apiKey: string;
    reconnectingConnectedAccountId: string | null;
  }): Promise<boolean> => {
    setErrorMessage(null);

    try {
      await connectApplicationWithApiKeyMutation({
        variables: {
          input: {
            applicationId,
            providerName: connectionProviderName,
            apiKey,
            reconnectingConnectedAccountId,
          },
        },
        // By name so only mounted lists refetch: the workspace list needs a permission the member may lack
        refetchQueries: ['MyConnectedAccounts', 'ApplicationConnectedAccounts'],
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? getErrorMessageFromApolloError(error)
          : t`An error occurred.`,
      );

      return false;
    }

    enqueueToast({
      status: 'success',
      children: t`${connectionProviderDisplayName} connected`,
    });

    return true;
  };

  return {
    connectApplicationWithApiKey,
    loading,
    errorMessage,
    clearErrorMessage: () => setErrorMessage(null),
  };
};
