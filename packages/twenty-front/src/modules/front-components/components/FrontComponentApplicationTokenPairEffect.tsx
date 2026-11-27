import { useEffect } from 'react';

import { convertUnknownToError } from '@/error-handler/utils/convertUnknownToError';
import { useFrontComponentApplicationTokenPair } from '@/front-components/hooks/useFrontComponentApplicationTokenPair';
import { frontComponentApplicationTokenPairLoadErrorComponentState } from '@/front-components/states/frontComponentApplicationTokenPairLoadErrorComponentState';
import { frontComponentInitialApplicationAccessTokenComponentState } from '@/front-components/states/frontComponentInitialApplicationAccessTokenComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

type FrontComponentApplicationTokenPairEffectProps = {
  applicationId: string;
};

export const FrontComponentApplicationTokenPairEffect = ({
  applicationId,
}: FrontComponentApplicationTokenPairEffectProps) => {
  const { loadFrontComponentApplicationTokenPair } =
    useFrontComponentApplicationTokenPair();

  const setFrontComponentInitialApplicationAccessToken =
    useSetAtomComponentState(
      frontComponentInitialApplicationAccessTokenComponentState,
    );
  const setFrontComponentApplicationTokenPairLoadError =
    useSetAtomComponentState(
      frontComponentApplicationTokenPairLoadErrorComponentState,
    );

  useEffect(() => {
    let isCancelled = false;

    const loadInitialApplicationAccessToken = async () => {
      try {
        const applicationTokenPair =
          await loadFrontComponentApplicationTokenPair(applicationId);

        if (isCancelled) {
          return;
        }

        setFrontComponentInitialApplicationAccessToken(
          (currentApplicationAccessToken) =>
            currentApplicationAccessToken ??
            applicationTokenPair.applicationAccessToken.token,
        );
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setFrontComponentApplicationTokenPairLoadError(
          convertUnknownToError(error),
        );
      }
    };

    loadInitialApplicationAccessToken();

    return () => {
      isCancelled = true;
    };
  }, [
    applicationId,
    loadFrontComponentApplicationTokenPair,
    setFrontComponentInitialApplicationAccessToken,
    setFrontComponentApplicationTokenPairLoadError,
  ]);

  return null;
};
