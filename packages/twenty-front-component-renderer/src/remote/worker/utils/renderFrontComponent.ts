import { type RemoteConnection } from '@remote-dom/core/elements';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { attachRemoteRenderRootToWorkerDocument } from '@/remote/worker/utils/attachRemoteRenderRootToWorkerDocument';
import { installHostFetchProxy } from '@/remote/worker/utils/installHostFetchProxy';
import { loadFrontComponentModule } from '@/remote/worker/utils/loadFrontComponentModule';
import { setWorkerEnvironmentVariablesFromRenderContext } from '@/remote/worker/utils/setWorkerEnvironmentVariablesFromRenderContext';
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
  if (!isDefined(hostFetch)) {
    throw new CustomError(
      'The front component fetch bridge is unavailable',
      'FRONT_COMPONENT_HOST_FETCH_UNAVAILABLE',
    );
  }

  installHostFetchProxy(hostFetch, renderContext.hostFetchOrigins ?? []);

  const renderContainer = attachRemoteRenderRootToWorkerDocument(connection);

  setWorkerEnvironmentVariablesFromRenderContext(renderContext);

  const componentModule = await loadFrontComponentModule({
    componentSource: renderContext.componentSource,
    sdkClientSources: renderContext.sdkClientSources,
  });

  componentModule.default(renderContainer);
};
