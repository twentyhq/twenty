import { useApolloClient } from '@apollo/client/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useFrontComponentApplicationTokenPair } from '@/front-components/hooks/useFrontComponentApplicationTokenPair';
import { frontComponentsSelector } from '@/front-components/states/frontComponentsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { GetApplicationSdkClientChecksumsDocument } from '~/generated-metadata/graphql';

type FrontComponentApplicationPrefetchEffectProps = {
  frontComponentId: string;
};

export const FrontComponentApplicationPrefetchEffect = ({
  frontComponentId,
}: FrontComponentApplicationPrefetchEffectProps) => {
  const apolloClient = useApolloClient();
  const frontComponents = useAtomStateValue(frontComponentsSelector);
  const { loadFrontComponentApplicationTokenPair } =
    useFrontComponentApplicationTokenPair();

  const frontComponent = frontComponents.find(
    ({ id }) => id === frontComponentId,
  );
  const applicationId = frontComponent?.applicationId;
  const usesSdkClient = frontComponent?.usesSdkClient === true;

  useEffect(() => {
    if (!isDefined(applicationId)) {
      return;
    }

    // Warms the token and Apollo caches while FindOneFrontComponent is in flight;
    // the renderer awaits the same requests and reports their errors.
    loadFrontComponentApplicationTokenPair(applicationId).catch(
      () => undefined,
    );

    if (usesSdkClient) {
      apolloClient
        .query({
          query: GetApplicationSdkClientChecksumsDocument,
          variables: { applicationId },
        })
        .catch(() => undefined);
    }
  }, [
    apolloClient,
    applicationId,
    loadFrontComponentApplicationTokenPair,
    usesSdkClient,
  ]);

  return null;
};
