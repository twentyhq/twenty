import { useEffect } from 'react';
import { type AiWorkspaceFrontComponentRuntime } from '@/front-components/types/AiWorkspaceFrontComponentRuntime';
import { loadAiWorkspaceFrontComponentRuntime } from '@/front-components/utils/loadAiWorkspaceFrontComponentRuntime';

type AiWorkspaceFrontComponentRuntimeEffectProps = {
  frontComponentId: string;
  onRuntimeLoaded: (runtime: AiWorkspaceFrontComponentRuntime) => void;
  onError: (error: Error) => void;
};

export const AiWorkspaceFrontComponentRuntimeEffect = ({
  frontComponentId,
  onRuntimeLoaded,
  onError,
}: AiWorkspaceFrontComponentRuntimeEffectProps) => {
  useEffect(() => {
    const controller = new AbortController();

    void loadAiWorkspaceFrontComponentRuntime({
      frontComponentId,
      signal: controller.signal,
    })
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
  }, [frontComponentId, onRuntimeLoaded, onError]);

  return null;
};
