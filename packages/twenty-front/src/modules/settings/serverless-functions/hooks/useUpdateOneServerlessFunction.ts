import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { UPDATE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/updateOneServerlessFunction';
import { useMutation } from '@apollo/client';
import {
  UpdateOneServerlessFunctionMutation,
  UpdateOneServerlessFunctionMutationVariables,
  UpdateServerlessFunctionInput,
} from '~/generated-metadata/graphql';
import { useEffect, useState } from 'react';
import { FIND_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunction';
import { sleep } from '~/utils/sleep';
import { getOperationName } from '@apollo/client/utilities';
import { FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunctionSourceCode';

export const useUpdateOneServerlessFunction = (
  serverlessFunctionId: string,
) => {
  const apolloMetadataClient = useApolloMetadataClient();
  const [isReady, setIsReady] = useState(false);
  const [mutate] = useMutation<
    UpdateOneServerlessFunctionMutation,
    UpdateOneServerlessFunctionMutationVariables
  >(UPDATE_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient,
  });

  const updateOneServerlessFunction = async (
    input: Omit<UpdateServerlessFunctionInput, 'id'>,
  ) => {
    const result = await mutate({
      variables: {
        input: { ...input, id: serverlessFunctionId },
      },
      refetchQueries: [
        getOperationName(FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE) ?? '',
      ],
    });
    setIsReady(false);
    return result;
  };

  useEffect(() => {
    let isMounted = true;

    const pollFunctionStatus = async () => {
      while (isMounted && !isReady) {
        const { data } = await apolloMetadataClient.query({
          query: FIND_ONE_SERVERLESS_FUNCTION,
          variables: { input: { id: serverlessFunctionId } },
          fetchPolicy: 'network-only', // Always fetch fresh data
        });

        const serverlessFunction = data?.findOneServerlessFunction;

        if (serverlessFunction?.syncStatus === 'READY') {
          setIsReady(true);
          break;
        }
        await sleep(500);
      }
    };

    pollFunctionStatus();

    return () => {
      isMounted = false; // Cleanup when the component unmounts
    };
  }, [serverlessFunctionId, apolloMetadataClient, isReady]);

  return { updateOneServerlessFunction, isReady };
};
