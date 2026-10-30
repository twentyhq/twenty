import { FrontComponentSourceRenderer } from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';
import { useThemeColorScheme } from 'twenty-ui/theme';

import { useAiWorkspaceFrontComponentRuntime } from '@/front-components/hooks/useAiWorkspaceFrontComponentRuntime';

import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { FrontComponentLoadErrorToastEffect } from '@/front-components/components/FrontComponentLoadErrorToastEffect';

type AiWorkspaceFrontComponentProps = {
  frontComponentId: string;
};

export const AiWorkspaceFrontComponent = ({
  frontComponentId,
}: AiWorkspaceFrontComponentProps) => {
  const colorScheme = useThemeColorScheme();
  const { runtime, error, setError } =
    useAiWorkspaceFrontComponentRuntime(frontComponentId);

  return (
    <>
      <FrontComponentLoadErrorToastEffect errorMessage={error?.message} />
      {isDefined(error) && <span role="alert">{error.message}</span>}
      {isDefined(runtime) && (
        <FrontComponentSourceRenderer
          componentId={frontComponentId}
          componentSource={runtime.componentSource}
          sharedDependenciesSource={runtime.sharedDependenciesSource}
          sharedDependenciesUrl={
            isDefined(runtime.sharedDependenciesChecksum)
              ? `${REACT_APP_SERVER_BASE_URL}/rest/ai-front-components/shared-dependencies/${runtime.sharedDependenciesChecksum}.js`
              : undefined
          }
          data={runtime.data}
          colorScheme={colorScheme}
          onError={setError}
        />
      )}
    </>
  );
};
