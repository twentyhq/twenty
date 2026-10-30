import { useEffect, useState } from 'react';
import { convertUnknownToError } from '@/error-handler/utils/convertUnknownToError';
import { useFrontComponentApplicationTokenPair } from '@/front-components/hooks/useFrontComponentApplicationTokenPair';
import { type AiWorkspaceFrontComponentRuntime } from '@/front-components/types/AiWorkspaceFrontComponentRuntime';
import { loadAiWorkspaceFrontComponentRuntimeOrThrow } from '@/front-components/utils/loadAiWorkspaceFrontComponentRuntimeOrThrow';

export const useAiWorkspaceFrontComponentRuntime = ({
  frontComponentId,
  applicationId,
}: {
  frontComponentId: string;
  applicationId: string;
}) => {
  const [runtime, setRuntime] = useState<AiWorkspaceFrontComponentRuntime>();
  const [error, setError] = useState<Error>();
  const { loadFrontComponentApplicationTokenPair } =
    useFrontComponentApplicationTokenPair();

  useEffect(() => {
    const controller = new AbortController();

    void loadFrontComponentApplicationTokenPair(applicationId)
      .then(({ applicationAccessToken }) =>
        loadAiWorkspaceFrontComponentRuntimeOrThrow({
          frontComponentId,
          applicationAccessToken: applicationAccessToken.token,
          signal: controller.signal,
        }),
      )
      .then((runtime) => {
        if (!controller.signal.aborted) {
          setRuntime(runtime);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setError(convertUnknownToError(error));
        }
      });

    return () => controller.abort();
  }, [applicationId, frontComponentId, loadFrontComponentApplicationTokenPair]);

  return { runtime, error, setError };
};
