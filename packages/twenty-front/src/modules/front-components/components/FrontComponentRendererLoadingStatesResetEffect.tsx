import { frontComponentApplicationTokenPairLoadErrorComponentState } from '@/front-components/states/frontComponentApplicationTokenPairLoadErrorComponentState';
import { frontComponentInitialApplicationAccessTokenComponentState } from '@/front-components/states/frontComponentInitialApplicationAccessTokenComponentState';
import { frontComponentSourcesPreloadComponentState } from '@/front-components/states/frontComponentSourcesPreloadComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';

export const FrontComponentRendererLoadingStatesResetEffect = () => {
  const setFrontComponentInitialApplicationAccessToken =
    useSetAtomComponentState(
      frontComponentInitialApplicationAccessTokenComponentState,
    );
  const setFrontComponentApplicationTokenPairLoadError =
    useSetAtomComponentState(
      frontComponentApplicationTokenPairLoadErrorComponentState,
    );
  const setFrontComponentSourcesPreload = useSetAtomComponentState(
    frontComponentSourcesPreloadComponentState,
  );

  useEffect(() => {
    return () => {
      setFrontComponentInitialApplicationAccessToken(null);
      setFrontComponentApplicationTokenPairLoadError(null);
      setFrontComponentSourcesPreload(null);
    };
  }, [
    setFrontComponentInitialApplicationAccessToken,
    setFrontComponentApplicationTokenPairLoadError,
    setFrontComponentSourcesPreload,
  ]);

  return null;
};
