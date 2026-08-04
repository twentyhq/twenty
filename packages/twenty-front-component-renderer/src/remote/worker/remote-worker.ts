import '@remote-dom/core/polyfill';
import '@remote-dom/react/polyfill';

import '../generated/remote-elements';

import { ThreadMessagePort } from '@quilted/threads';

import { isDefined } from 'twenty-shared/utils';
import { FRONT_COMPONENT_LOCAL_STORAGE_BRIDGE_KEY } from 'twenty-sdk/front-component-renderer';

import { frontComponentHostCommunicationApi } from '@/constants/frontComponentHostCommunicationApi';
import { HTML_TAG_TO_CUSTOM_ELEMENT_TAG } from '@/constants/HtmlTagToRemoteComponent';
import { installDocumentGetElementById } from '@/polyfills/dom/utils/installDocumentGetElementById';
import { installGetComputedStyle } from '@/polyfills/dom/utils/installGetComputedStyle';
import { installGetElementsByClassName } from '@/polyfills/dom/utils/installGetElementsByClassName';
import { installLocalStyleOnBaseElements } from '@/polyfills/dom/utils/installLocalStyleOnBaseElements';
import { workerGeometryStore } from '@/polyfills/geometry/workerGeometryStore';
import { installElementGeometryPolyfill } from '@/polyfills/geometry/utils/installElementGeometryPolyfill';
import { installWindowGeometryPolyfill } from '@/polyfills/geometry/utils/installWindowGeometryPolyfill';
import { installStorageShims } from '@/polyfills/storage/utils/installStorageShims';
import { exposeGlobals } from '@/remote/utils/exposeGlobals';
import { installStylePropertyOnRemoteElements } from '@/remote/utils/installStylePropertyOnRemoteElements';
import { patchRemoteElementAttributes } from '@/remote/utils/patchRemoteElementAttributes';
import { frontComponentLocalStorageBridge } from '@/remote/worker/frontComponentLocalStorageBridge';
import { buildFrontComponentHostCommunicationApiFromThreadImports } from '@/remote/worker/utils/buildFrontComponentHostCommunicationApiFromThreadImports';
import { handleCommandConfirmationModalResult } from '@/remote/worker/utils/createCommandConfirmationModalBridge';
import { installErrorEventBridge } from '@/remote/worker/utils/installErrorEventBridge';
import { renderFrontComponent } from '@/remote/worker/utils/renderFrontComponent';
import { setFrontComponentExecutionContext } from '@/remote/worker/utils/setFrontComponentExecutionContext';
import { type FrontComponentHostThread } from '@/types/FrontComponentHostThread';
import { type FrontComponentHostThreadExports } from '@/types/FrontComponentHostThreadExports';
import { type WorkerExports } from '@/types/WorkerExports';
import { createClonableErrorThreadSerialization } from '@/utils/createClonableErrorThreadSerialization';

installStylePropertyOnRemoteElements();
patchRemoteElementAttributes();
installErrorEventBridge();

installDocumentGetElementById(document);
installGetElementsByClassName(Element.prototype);
installGetElementsByClassName(document);
installLocalStyleOnBaseElements(Element.prototype);

installGetComputedStyle(globalThis as unknown as Record<string, unknown>);

installElementGeometryPolyfill({
  elementPrototype: Element.prototype,
  documentTarget: document,
  geometryStore: workerGeometryStore,
});

installWindowGeometryPolyfill({
  globalScope: globalThis as unknown as Record<string, unknown>,
  geometryStore: workerGeometryStore,
});

installStorageShims({
  globalScope: globalThis as unknown as Record<string, unknown>,
  localStorageBridge: frontComponentLocalStorageBridge,
});

exposeGlobals({
  __HTML_TAG_TO_CUSTOM_ELEMENT_TAG__: HTML_TAG_TO_CUSTOM_ELEMENT_TAG,
  [FRONT_COMPONENT_LOCAL_STORAGE_BRIDGE_KEY]: frontComponentLocalStorageBridge,
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

    frontComponentLocalStorageBridge.flushPendingPersistOperations();
  },
  updateContext: async (context) => {
    setFrontComponentExecutionContext(context);
  },
  onConfirmationModalResult: async (result) => {
    await handleCommandConfirmationModalResult(result);
  },
  pushGeometryUpdates: async (batch) => {
    workerGeometryStore.applyGeometryBatch(batch);
  },
};

self.addEventListener('message', (event) => {
  const [transferredPort] = event.ports;

  if (isDefined(hostThread) || !isDefined(transferredPort)) {
    return;
  }

  const nextHostThread = new ThreadMessagePort<
    FrontComponentHostThreadExports,
    WorkerExports
  >(transferredPort, {
    exports: workerExports,
    serialization: createClonableErrorThreadSerialization(),
  });
  hostThread = nextHostThread;

  workerGeometryStore.connectTransport(nextHostThread.imports);

  transferredPort.start();
});
