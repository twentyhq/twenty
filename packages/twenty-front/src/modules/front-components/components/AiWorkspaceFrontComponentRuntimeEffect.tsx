import { useEffect } from 'react';
import { useFrontComponentApplicationTokenPair } from '@/front-components/hooks/useFrontComponentApplicationTokenPair';
import { type AiWorkspaceFrontComponentRuntime } from '@/front-components/types/AiWorkspaceFrontComponentRuntime';
import { loadAiWorkspaceFrontComponentRuntime } from '@/front-components/utils/loadAiWorkspaceFrontComponentRuntime';

type AiWorkspaceFrontComponentRuntimeEffectProps = {
  frontComponentId: string;
  applicationId: string;
  onRuntimeLoaded: (runtime: AiWorkspaceFrontComponentRuntime) => void;
  onError: (error: Error) => void;
};

export const AiWorkspaceFrontComponentRuntimeEffect = ({
  frontComponentId,
  applicationId,
  onRuntimeLoaded,
  onError,
}: AiWorkspaceFrontComponentRuntimeEffectProps) => {
  const { loadFrontComponentApplicationTokenPair } =
    useFrontComponentApplicationTokenPair();

  useEffect(() => {
    const controller = new AbortController();

    void loadFrontComponentApplicationTokenPair(applicationId)
      .then(({ applicationAccessToken }) =>
        loadAiWorkspaceFrontComponentRuntime({
          frontComponentId,
          applicationAccessToken: applicationAccessToken.token,
          signal: controller.signal,
        }),
      )
      .then((runtime) => {
        if (!controller.signal.aborted) {
          onRuntimeLoaded(runtime);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      });

    return () => controller.abort();
  }, [
    applicationId,
    frontComponentId,
    loadFrontComponentApplicationTokenPair,
    onRuntimeLoaded,
    onError,
  ]);

  return null;
};
