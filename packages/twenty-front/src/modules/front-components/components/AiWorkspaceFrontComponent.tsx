import { useState } from 'react';
import { AiWorkspaceFrontComponentRuntimeEffect } from '@/front-components/components/AiWorkspaceFrontComponentRuntimeEffect';
import { type AiWorkspaceFrontComponentRuntime } from '@/front-components/types/AiWorkspaceFrontComponentRuntime';
import { getFingerprintedRestUrl } from '@/front-components/utils/getFingerprintedRestUrl';
import { FrontComponentSourceRenderer } from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';
import { useThemeColorScheme } from 'twenty-ui/theme';

import { FrontComponentLoadErrorToastEffect } from '@/front-components/components/FrontComponentLoadErrorToastEffect';

type AiWorkspaceFrontComponentProps = {
  frontComponentId: string;
};

export const AiWorkspaceFrontComponent = ({
  frontComponentId,
}: AiWorkspaceFrontComponentProps) => {
  const colorScheme = useThemeColorScheme();
  const [runtime, setRuntime] = useState<AiWorkspaceFrontComponentRuntime>();
  const [error, setError] = useState<Error>();

  return (
    <>
      <AiWorkspaceFrontComponentRuntimeEffect
        frontComponentId={frontComponentId}
        onRuntimeLoaded={setRuntime}
        onError={setError}
      />
      <FrontComponentLoadErrorToastEffect errorMessage={error?.message} />
      {isDefined(error) && <span role="alert">{error.message}</span>}
      {isDefined(runtime) && (
        <FrontComponentSourceRenderer
          componentId={frontComponentId}
          componentSource={runtime.componentSource}
          sharedDependenciesSource={runtime.sharedDependenciesSource}
          sharedDependenciesUrl={
            isDefined(runtime.sharedDependenciesChecksum)
              ? getFingerprintedRestUrl({
                  resource: 'front-component-shared-dependencies/bundles',
                  id: runtime.applicationId,
                  checksum: runtime.sharedDependenciesChecksum,
                })
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
