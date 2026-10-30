import { useAiWorkspaceFrontComponentRuntime } from '@/front-components/hooks/useAiWorkspaceFrontComponentRuntime';
import { FrontComponentSourceRenderer } from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';
import { useThemeColorScheme } from 'twenty-ui/theme';

import { FrontComponentLoadErrorToastEffect } from '@/front-components/components/FrontComponentLoadErrorToastEffect';

type AiWorkspaceFrontComponentProps = {
  frontComponentId: string;
  applicationId: string;
};

export const AiWorkspaceFrontComponent = ({
  frontComponentId,
  applicationId,
}: AiWorkspaceFrontComponentProps) => {
  const colorScheme = useThemeColorScheme();
  const { runtime, error, setError } = useAiWorkspaceFrontComponentRuntime({
    frontComponentId,
    applicationId,
  });

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
