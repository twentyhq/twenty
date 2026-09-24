import { useEffect } from 'react';

import { useFrontComponentApplicationSession } from '@/front-components/hooks/useFrontComponentApplicationSession';
import { type FrontComponentApplicationSession } from '@/front-components/types/FrontComponentApplicationSession';

type FrontComponentApplicationSessionEffectProps = {
  applicationId: string;
  onApplicationSessionLoaded: (
    applicationSession: FrontComponentApplicationSession,
  ) => void;
  onApplicationSessionLoadFailed: (error: Error) => void;
};

export const FrontComponentApplicationSessionEffect = ({
  applicationId,
  onApplicationSessionLoaded,
  onApplicationSessionLoadFailed,
}: FrontComponentApplicationSessionEffectProps) => {
  const { loadFrontComponentApplicationSession } =
    useFrontComponentApplicationSession();

  useEffect(() => {
    let isCancelled = false;

    loadFrontComponentApplicationSession(applicationId)
      .then((applicationSession) => {
        if (!isCancelled) {
          onApplicationSessionLoaded(applicationSession);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          onApplicationSessionLoadFailed(
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    applicationId,
    loadFrontComponentApplicationSession,
    onApplicationSessionLoaded,
    onApplicationSessionLoadFailed,
  ]);

  return null;
};
