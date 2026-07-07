import { isDefined } from 'twenty-shared/utils';

import { setWorkerEnv } from '@/remote/worker/utils/setWorkerEnv';
import { type HostToWorkerRenderContext } from '@/types/HostToWorkerRenderContext';

export const setWorkerEnvFromRenderContext = (
  renderContext: HostToWorkerRenderContext,
): void => {
  if (isDefined(renderContext.applicationVariables)) {
    setWorkerEnv({
      applicationVariables: JSON.stringify(renderContext.applicationVariables),
    });
  }

  if (isDefined(renderContext.apiUrl)) {
    setWorkerEnv({
      TWENTY_API_URL: renderContext.apiUrl,
    });
  }

  if (isDefined(renderContext.functionsBaseUrl)) {
    setWorkerEnv({
      TWENTY_FUNCTIONS_URL: renderContext.functionsBaseUrl,
    });
  }

  if (isDefined(renderContext.applicationAccessToken)) {
    setWorkerEnv({
      TWENTY_APP_ACCESS_TOKEN: renderContext.applicationAccessToken,
    });
  }
};
