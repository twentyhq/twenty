import '@remote-dom/core/polyfill';
import '@remote-dom/react/polyfill';

import '../generated/remote-elements';

import { ThreadMessagePort } from '@quilted/threads';

import { isDefined } from 'twenty-shared/utils';

import { frontComponentHostCommunicationApi } from '@/constants/frontComponentHostCommunicationApi';
import { HTML_TAG_TO_CUSTOM_ELEMENT_TAG } from '@/constants/HtmlTagToRemoteComponent';
import { exposeGlobals } from '@/remote/utils/exposeGlobals';
import { installStylePropertyOnRemoteElements } from '@/remote/utils/installStylePropertyOnRemoteElements';
import { patchRemoteElementAttributes } from '@/remote/utils/patchRemoteElementAttributes';
import { buildFrontComponentHostCommunicationApiFromThreadImports } from '@/remote/worker/utils/buildFrontComponentHostCommunicationApiFromThreadImports';
import { handleCommandConfirmationModalResult } from '@/remote/worker/utils/createCommandConfirmationModalBridge';
import { installErrorEventBridge } from '@/remote/worker/utils/installErrorEventBridge';
import { renderFrontComponent } from '@/remote/worker/utils/renderFrontComponent';
import { setFrontComponentExecutionContext } from '@/remote/worker/utils/setFrontComponentExecutionContext';
import { type FrontComponentHostThread } from '@/types/FrontComponentHostThread';
import { type FrontComponentHostThreadExports } from '@/types/FrontComponentHostThreadExports';
import { type WorkerExports } from '@/types/WorkerExports';

installStylePropertyOnRemoteElements();
patchRemoteElementAttributes();
installErrorEventBridge();

exposeGlobals({
  __HTML_TAG_TO_CUSTOM_ELEMENT_TAG__: HTML_TAG_TO_CUSTOM_ELEMENT_TAG,
});

let hostThread: FrontComponentHostThread | null = null;

const workerExports: WorkerExports = {
  render: async (connection, renderContext) => {
    await renderFrontComponent({
      connection,
      renderContext,
      hostFetch: hostThread?.imports.hostFetch ?? null,
    });
  },
  initializeHostCommunicationApi: async () => {
    if (!isDefined(hostThread)) {
      return;
    }

    Object.assign(
      frontComponentHostCommunicationApi,
      buildFrontComponentHostCommunicationApiFromThreadImports(
        hostThread.imports,
      ),
    );
  },
  updateContext: async (context) => {
    setFrontComponentExecutionContext(context);
  },
  onConfirmationModalResult: async (result) => {
    await handleCommandConfirmationModalResult(result);
  },
};

self.addEventListener('message', (event) => {
  const [transferredPort] = event.ports;

  if (isDefined(hostThread) || !isDefined(transferredPort)) {
    return;
  }

  hostThread = new ThreadMessagePort<
    FrontComponentHostThreadExports,
    WorkerExports
  >(transferredPort, {
    exports: workerExports,
  });

  transferredPort.start();
});
