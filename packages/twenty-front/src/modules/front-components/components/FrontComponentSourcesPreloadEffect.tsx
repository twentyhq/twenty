import { useEffect } from 'react';
import { fetchFrontComponentSources } from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';

import { useFrontComponentSourceUrls } from '@/front-components/hooks/useFrontComponentSourceUrls';
import { frontComponentInitialApplicationAccessTokenComponentState } from '@/front-components/states/frontComponentInitialApplicationAccessTokenComponentState';
import { frontComponentSourcesPreloadComponentState } from '@/front-components/states/frontComponentSourcesPreloadComponentState';
import { type FrontComponentFieldsNeededToStartLoading } from '@/front-components/types/FrontComponentFieldsNeededToStartLoading';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { logError } from '~/utils/logError';

type FrontComponentSourcesPreloadEffectProps = {
  frontComponentFieldsNeededToStartLoading: FrontComponentFieldsNeededToStartLoading;
};

export const FrontComponentSourcesPreloadEffect = ({
  frontComponentFieldsNeededToStartLoading,
}: FrontComponentSourcesPreloadEffectProps) => {
  const { usesSdkClient } = frontComponentFieldsNeededToStartLoading;

  const frontComponentInitialApplicationAccessToken =
    useAtomComponentStateValue(
      frontComponentInitialApplicationAccessTokenComponentState,
    );
  const setFrontComponentSourcesPreload = useSetAtomComponentState(
    frontComponentSourcesPreloadComponentState,
  );

  const {
    componentUrl,
    sdkClientUrls,
    sharedDependenciesUrl,
    hasSharedDependencies,
    isSdkClientReady,
  } = useFrontComponentSourceUrls(frontComponentFieldsNeededToStartLoading);

  useEffect(() => {
    if (
      !isDefined(frontComponentInitialApplicationAccessToken) ||
      !isSdkClientReady
    ) {
      return;
    }

    const fetchSourcesOrUndefinedOnFailure = async () => {
      try {
        return await fetchFrontComponentSources({
          componentUrl,
          sdkClientUrls,
          sharedDependenciesUrl,
          applicationAccessToken: frontComponentInitialApplicationAccessToken,
          shouldPrefetchSdkClientSources: usesSdkClient,
          shouldPrefetchSharedDependenciesSource: hasSharedDependencies,
        });
      } catch (error) {
        logError(error);

        return undefined;
      }
    };

    setFrontComponentSourcesPreload({
      componentUrl,
      sdkClientUrls,
      sharedDependenciesUrl,
      sourcesPromise: fetchSourcesOrUndefinedOnFailure(),
    });
  }, [
    componentUrl,
    sdkClientUrls,
    sharedDependenciesUrl,
    frontComponentInitialApplicationAccessToken,
    isSdkClientReady,
    usesSdkClient,
    hasSharedDependencies,
    setFrontComponentSourcesPreload,
  ]);

  return null;
};
