import { useEffect } from 'react';

import { useFrontComponentApplicationTokenPair } from '@/front-components/hooks/useFrontComponentApplicationTokenPair';
import { type FrontComponentApplicationTokenPair } from '@/front-components/types/FrontComponentApplicationTokenPair';

type FrontComponentApplicationTokenPairEffectProps = {
  applicationId: string;
  onApplicationTokenPairLoaded: (
    applicationTokenPair: FrontComponentApplicationTokenPair,
  ) => void;
  onApplicationTokenPairLoadFailed: (error: Error) => void;
};

export const FrontComponentApplicationTokenPairEffect = ({
  applicationId,
  onApplicationTokenPairLoaded,
  onApplicationTokenPairLoadFailed,
}: FrontComponentApplicationTokenPairEffectProps) => {
  const { loadFrontComponentApplicationTokenPair } =
    useFrontComponentApplicationTokenPair();

  useEffect(() => {
    let isCancelled = false;

    loadFrontComponentApplicationTokenPair(applicationId)
      .then((applicationTokenPair) => {
        if (!isCancelled) {
          onApplicationTokenPairLoaded(applicationTokenPair);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          onApplicationTokenPairLoadFailed(
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    applicationId,
    loadFrontComponentApplicationTokenPair,
    onApplicationTokenPairLoaded,
    onApplicationTokenPairLoadFailed,
  ]);

  return null;
};
