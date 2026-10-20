import { useEffect, useState } from 'react';
import { t } from '@lingui/core/macro';
import { FrontComponentSourceRenderer } from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';
import { useThemeColorScheme } from 'twenty-ui/theme';

import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { FrontComponentLoadErrorToastEffect } from '@/front-components/components/FrontComponentLoadErrorToastEffect';

type AiWorkspaceFrontComponentProps = {
  frontComponentId: string;
};

export const AiWorkspaceFrontComponent = ({
  frontComponentId,
}: AiWorkspaceFrontComponentProps) => {
  const colorScheme = useThemeColorScheme();
  const [runtime, setRuntime] = useState<{
    componentSource: string;
    sharedDependenciesSource?: string;
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

  return (
    <>
      <FrontComponentLoadErrorToastEffect errorMessage={error?.message} />
      {isDefined(error) && <span role="alert">{error.message}</span>}
      {isDefined(runtime) && (
        <FrontComponentSourceRenderer
          componentId={frontComponentId}
          componentSource={runtime.componentSource}
          sharedDependenciesSource={runtime.sharedDependenciesSource}
          data={runtime.data}
          colorScheme={colorScheme}
          onError={setError}
        />
      )}
    </>
  );
};
