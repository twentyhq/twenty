import '@remote-dom/core/polyfill';
import '@remote-dom/react/polyfill';

import '../generated/remote-elements';

import { ThreadMessagePort } from '@quilted/threads';

import { isDefined } from 'twenty-shared/utils';

import { frontComponentHostCommunicationApi } from '@/remote/worker/thread/states/frontComponentHostCommunicationApi';
import { HTML_TAG_TO_CUSTOM_ELEMENT_TAG } from '@/constants/HtmlTagToCustomElementTag';
import { installClipboardPolyfill } from '@/polyfills/clipboard/utils/installClipboardPolyfill';
import { installDocumentGetElementById } from '@/polyfills/dom/utils/installDocumentGetElementById';
import { installGetComputedStyle } from '@/polyfills/dom/utils/installGetComputedStyle';
import { installGetElementsByClassName } from '@/polyfills/dom/utils/installGetElementsByClassName';
import { installLocalStyleOnBaseElements } from '@/polyfills/dom/utils/installLocalStyleOnBaseElements';
import { installMutationObserver } from '@/polyfills/dom/utils/installMutationObserver';
import { workerGeometryStore } from '@/polyfills/geometry/states/workerGeometryStore';
import { installElementGeometryPolyfill } from '@/polyfills/geometry/utils/installElementGeometryPolyfill';
import { installWindowGeometryPolyfill } from '@/polyfills/geometry/utils/installWindowGeometryPolyfill';
import { workerMediaBridge } from '@/polyfills/media/states/workerMediaBridge';
import { installMediaCapturePolyfills } from '@/polyfills/media/utils/installMediaCapturePolyfills';
import { frontComponentStorageBridges } from '@/polyfills/storage/states/frontComponentStorageBridges';
import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';
import { installStorageBridge } from '@/polyfills/storage/utils/installStorageBridge';
import { exposeGlobals } from '@/utils/exposeGlobals';
import { installStylePropertyOnRemoteElements } from '@/remote/elements/utils/installStylePropertyOnRemoteElements';
import { patchRemoteElementAttributes } from '@/remote/elements/utils/patchRemoteElementAttributes';
import { buildFrontComponentHostCommunicationApiFromThreadImports } from '@/remote/worker/thread/utils/buildFrontComponentHostCommunicationApiFromThreadImports';
import { handleCommandConfirmationModalResult } from '@/remote/worker/thread/utils/handleCommandConfirmationModalResult';
import { installErrorEventBridge } from '@/remote/worker/thread/utils/installErrorEventBridge';
import { renderFrontComponent } from '@/remote/worker/rendering/utils/renderFrontComponent';
import { setFrontComponentExecutionContext } from '@/remote/worker/environment/utils/setFrontComponentExecutionContext';
import { type FrontComponentHostThread } from '@/types/FrontComponentHostThread';
import { type FrontComponentHostThreadExports } from '@/types/FrontComponentHostThreadExports';
import { type WorkerExports } from '@/types/WorkerExports';
import { createClonableErrorThreadSerialization } from '@/utils/clonable-error/createClonableErrorThreadSerialization';

installStylePropertyOnRemoteElements();
patchRemoteElementAttributes();
installErrorEventBridge();

installDocumentGetElementById(document);
installGetElementsByClassName(Element.prototype);
installGetElementsByClassName(document);
installLocalStyleOnBaseElements(Element.prototype);

installGetComputedStyle(toGlobalScopeRecord(globalThis));

installMutationObserver({
  globalScope: toGlobalScopeRecord(globalThis),
});

installElementGeometryPolyfill({
  elementPrototype: Element.prototype,
  documentTarget: document,
  geometryStore: workerGeometryStore,
});

installWindowGeometryPolyfill({
  globalScope: toGlobalScopeRecord(globalThis),
  geometryStore: workerGeometryStore,
});

installStorageBridge({
  globalScope: toGlobalScopeRecord(globalThis),
  storageBridges: frontComponentStorageBridges,
});

installClipboardPolyfill({
  globalScope: toGlobalScopeRecord(globalThis),
  // Resolved lazily: the host communication api is populated after worker
  // boot, so the polyfill must not capture the function at install time.
  copyToClipboard: (text) => {
    const copyToClipboardFunction =
      frontComponentHostCommunicationApi.copyToClipboard;

    if (!isDefined(copyToClipboardFunction)) {
      return Promise.reject(new Error('copyToClipboardFunction is not set'));
    }

    return copyToClipboardFunction(text);
  },
});

installMediaCapturePolyfills({
  globalScope: toGlobalScopeRecord(globalThis),
  bridge: workerMediaBridge,
});

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

    for (const storageBridge of Object.values(frontComponentStorageBridges)) {
      storageBridge.connectHostCommunicationApi(
        frontComponentHostCommunicationApi,
      );
    }
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
  pushMediaSessionEvents: async (batch) => {
    workerMediaBridge.dispatchEvents(batch);
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
  workerMediaBridge.connectTransport(nextHostThread.imports);

  transferredPort.start();
});
