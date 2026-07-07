import { type RemoteConnection } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { attachRemoteRenderRoot } from '@/remote/worker/utils/attachRemoteRenderRoot';
import { installHostFetchProxy } from '@/remote/worker/utils/installHostFetchProxy';
import { loadFrontComponentModule } from '@/remote/worker/utils/loadFrontComponentModule';
import { setWorkerEnvFromRenderContext } from '@/remote/worker/utils/setWorkerEnvFromRenderContext';
import { type HostFetchFunction } from '@/types/HostFetchFunction';
import { type HostToWorkerRenderContext } from '@/types/HostToWorkerRenderContext';

type RenderFrontComponentInput = {
  connection: RemoteConnection;
  renderContext: HostToWorkerRenderContext;
  hostFetch: HostFetchFunction | null;
};

export const renderFrontComponent = async ({
  connection,
  renderContext,
  hostFetch,
}: RenderFrontComponentInput): Promise<void> => {
  if (isDefined(hostFetch)) {
    installHostFetchProxy(hostFetch, renderContext.hostFetchOrigins ?? []);
  }

  const renderContainer = attachRemoteRenderRoot(connection);

  setWorkerEnvFromRenderContext(renderContext);

  const componentModule = await loadFrontComponentModule({
    componentUrl: renderContext.componentUrl,
    sdkClientUrls: renderContext.sdkClientUrls,
    applicationAccessToken: renderContext.applicationAccessToken,
  });

  componentModule.default(renderContainer);
};
