import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';

import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const useAiWorkspaceFrontComponentRuntime = (
  frontComponentId: string,
) => {
  const [runtime, setRuntime] = useState<{
    componentSource: string;
    sharedDependenciesSource?: string;
    sharedDependenciesChecksum?: string;
    data: Record<string, unknown>;
  }>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const controller = new AbortController();

    void fetch(
      `${REACT_APP_SERVER_BASE_URL}/rest/ai-front-components/${encodeURIComponent(frontComponentId)}/runtime`,
      { credentials: 'include', signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(t`Could not load this component or its data.`);
        }
        return response.json();
      })
      .then((result) => {
        if (!controller.signal.aborted) {
          setRuntime(result);
        }
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            failure instanceof Error ? failure : new Error(String(failure)),
          );
        }
      });

    return () => controller.abort();
  }, [frontComponentId]);

  return { runtime, error, setError };
};
