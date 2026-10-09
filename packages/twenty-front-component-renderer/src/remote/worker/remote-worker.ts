import '@remote-dom/core/polyfill';
import '@remote-dom/react/polyfill';

import {
  HtmlInputElement,
  HtmlImgElement,
  HtmlTextareaElement,
} from '../generated/remote-elements';

import { ThreadMessagePort } from '@quilted/threads';

import { isDefined } from 'twenty-shared/utils';

import { frontComponentHostCommunicationApi } from '@/remote/worker/thread/states/frontComponentHostCommunicationApi';
import { HTML_TAG_TO_CUSTOM_ELEMENT_TAG } from '@/constants/HtmlTagToCustomElementTag';
import { installClipboardPolyfill } from '@/polyfills/clipboard/utils/installClipboardPolyfill';
import { installImageLoadingPolyfill } from '@/polyfills/image/utils/installImageLoadingPolyfill';
import { installImageObjectUrlPolyfill } from '@/polyfills/image/utils/installImageObjectUrlPolyfill';
import { workerActiveElementStore } from '@/polyfills/dom/states/workerActiveElementStore';
import { installTextTreeWalkerPolyfill } from '@/polyfills/dom/utils/installTextTreeWalkerPolyfill';
import { installInputSelectionPolyfill } from '@/polyfills/input-selection/utils/installInputSelectionPolyfill';
import { workerInputSelectionStore } from '@/polyfills/input-selection/states/workerInputSelectionStore';
import { workerFocusTransport } from '@/polyfills/dom/states/workerFocusTransport';
import { installActiveElementDetachmentHook } from '@/polyfills/dom/utils/installActiveElementDetachmentHook';
import { installClassAttributeAccessors } from '@/polyfills/dom/utils/installClassAttributeAccessors';
import { installCompareDocumentPositionPolyfill } from '@/polyfills/dom/utils/installCompareDocumentPositionPolyfill';
import { installDocumentActiveElementPolyfill } from '@/polyfills/dom/utils/installDocumentActiveElementPolyfill';
import { findElementByRemoteId } from '@/polyfills/dom/utils/findElementByRemoteId';
import { installDocumentGetElementById } from '@/polyfills/dom/utils/installDocumentGetElementById';
import { installElementDatasetPolyfill } from '@/polyfills/dom/utils/installElementDatasetPolyfill';
import { installElementClickMethodPolyfill } from '@/polyfills/dom/utils/installElementClickMethodPolyfill';
import { installFocusAndBlurMethodsPolyfill } from '@/polyfills/dom/utils/installFocusAndBlurMethodsPolyfill';
import { installGetComputedStyle } from '@/polyfills/dom/utils/installGetComputedStyle';
import { installGetElementsByClassName } from '@/polyfills/dom/utils/installGetElementsByClassName';
import { installGetRootNodePolyfill } from '@/polyfills/dom/utils/installGetRootNodePolyfill';
import { installInputClickActivationPolyfill } from '@/polyfills/dom/utils/installInputClickActivationPolyfill';
import { installLocalStyleOnBaseElements } from '@/polyfills/dom/utils/installLocalStyleOnBaseElements';
import { installMutationObserver } from '@/polyfills/dom/utils/installMutationObserver';
import { installNodeContainsPolyfill } from '@/polyfills/dom/utils/installNodeContainsPolyfill';
import { resolvePolyfillHooks } from '@/polyfills/dom/utils/resolvePolyfillHooks';
import { installEventConstructorPolyfills } from '@/polyfills/events/utils/installEventConstructorPolyfills';
import { installHostEventRetargetingPolyfill } from '@/polyfills/events/utils/installHostEventRetargetingPolyfill';
import { installSelectorMethodsPolyfill } from '@/polyfills/selectors/utils/installSelectorMethodsPolyfill';
import { workerGeometryStore } from '@/polyfills/geometry/states/workerGeometryStore';
import { installElementGeometryPolyfill } from '@/polyfills/geometry/utils/installElementGeometryPolyfill';
import { installVisualViewportPolyfill } from '@/polyfills/geometry/utils/installVisualViewportPolyfill';
import { installWindowGeometryPolyfill } from '@/polyfills/geometry/utils/installWindowGeometryPolyfill';
import { mediaQueryEnvironmentSource } from '@/polyfills/media-query/states/mediaQueryEnvironmentSource';
import { workerMediaBridge } from '@/polyfills/media/states/workerMediaBridge';
import { installMediaCapturePolyfills } from '@/polyfills/media/utils/installMediaCapturePolyfills';
import { installMatchMediaPolyfill } from '@/polyfills/media-query/utils/installMatchMediaPolyfill';
import { frontComponentStorageBridges } from '@/polyfills/storage/states/frontComponentStorageBridges';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';
import { installStorageBridge } from '@/polyfills/storage/utils/installStorageBridge';
import { installWindowAliasesPolyfill } from '@/polyfills/window-aliases/utils/installWindowAliasesPolyfill';
import { exposeGlobals } from '@/utils/exposeGlobals';
import { installAriaBooleanPropertyAccessors } from '@/remote/elements/utils/installAriaBooleanPropertyAccessors';
import { installStylePropertyOnRemoteElements } from '@/remote/elements/utils/installStylePropertyOnRemoteElements';
import { patchRemoteElementAttributes } from '@/remote/elements/utils/patchRemoteElementAttributes';
import { resolveRemoteElementPrototypes } from '@/remote/elements/utils/resolveRemoteElementPrototypes';
import { buildFrontComponentHostCommunicationApiFromThreadImports } from '@/remote/worker/thread/utils/buildFrontComponentHostCommunicationApiFromThreadImports';
import { handleCommandConfirmationModalResult } from '@/remote/worker/thread/utils/handleCommandConfirmationModalResult';
import { installErrorEventBridge } from '@/remote/worker/thread/utils/installErrorEventBridge';
import { renderFrontComponent } from '@/remote/worker/rendering/utils/renderFrontComponent';
import { setFrontComponentExecutionContext } from '@/remote/worker/environment/utils/setFrontComponentExecutionContext';
import { type FrontComponentHostThread } from '@/types/FrontComponentHostThread';
import { type FrontComponentHostThreadExports } from '@/types/FrontComponentHostThreadExports';
import { type WorkerExports } from '@/types/WorkerExports';
import { createClonableErrorThreadSerialization } from '@/utils/clonable-error/createClonableErrorThreadSerialization';

installImageObjectUrlPolyfill({
  urlConstructor: URL,
  imageElementPrototype: HtmlImgElement.prototype,
});

installStylePropertyOnRemoteElements();
patchRemoteElementAttributes();
installAriaBooleanPropertyAccessors();
installErrorEventBridge();

installTextTreeWalkerPolyfill({ globalScope: toGlobalScopeRecord(globalThis) });
installInputSelectionPolyfill({
  elementPrototypes: [
    HtmlInputElement.prototype,
    HtmlTextareaElement.prototype,
  ],
  selectionStore: workerInputSelectionStore,
});
installDocumentGetElementById(document);
installGetElementsByClassName(Element.prototype);
installGetElementsByClassName(document);
installClassAttributeAccessors({
  elementPrototype: Element.prototype,
  remoteElementPrototypes: resolveRemoteElementPrototypes(),
});
installLocalStyleOnBaseElements(Element.prototype);
installElementDatasetPolyfill(Element.prototype);

installNodeContainsPolyfill(Node.prototype);
installCompareDocumentPositionPolyfill({
  nodeConstructor: Node,
  nodePrototype: Node.prototype,
});
installGetRootNodePolyfill(Node.prototype);
installSelectorMethodsPolyfill({
  elementPrototype: Element.prototype,
  querySelectorTargets: [
    Element.prototype,
    DocumentFragment.prototype,
    document,
  ],
  resolveActiveElement: () => workerActiveElementStore.getActiveElement(),
  resolveFocusVisibleElement: () =>
    workerActiveElementStore.getFocusVisibleElement(),
});
installFocusAndBlurMethodsPolyfill({
  elementPrototype: Element.prototype,
  activeElementStore: workerActiveElementStore,
  forwardFocusMethod: workerFocusTransport.forwardFocusMethod,
});
installDocumentActiveElementPolyfill({
  documentTarget: document,
  activeElementStore: workerActiveElementStore,
});
installActiveElementDetachmentHook({
  hooks: resolvePolyfillHooks(
    resolveGlobalScopeInstallTargets(toGlobalScopeRecord(globalThis)),
  ),
  activeElementStore: workerActiveElementStore,
  onRemoveSubtree: (node) => {
    workerFocusTransport.blurFocusedElementWithinSubtree(node);
    workerInputSelectionStore.scheduleDetachedElementSweep();
  },
});
installHostEventRetargetingPolyfill(HTMLElement.prototype);
installElementClickMethodPolyfill(HTMLElement.prototype);
installInputClickActivationPolyfill(HtmlInputElement.prototype);

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

installVisualViewportPolyfill({
  globalScope: toGlobalScopeRecord(globalThis),
  geometryStore: workerGeometryStore,
});

installWindowAliasesPolyfill({
  globalScope: toGlobalScopeRecord(globalThis),
});

installMatchMediaPolyfill({
  globalScope: toGlobalScopeRecord(globalThis),
  environmentSource: mediaQueryEnvironmentSource,
});

installEventConstructorPolyfills({
  globalScope: toGlobalScopeRecord(globalThis),
});

installStorageBridge({
  globalScope: toGlobalScopeRecord(globalThis),
  storageBridges: frontComponentStorageBridges,
});

installClipboardPolyfill({
  globalScope: toGlobalScopeRecord(globalThis),
  // Resolved lazily: the host communication api is populated after worker boot.
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

installImageLoadingPolyfill({
  globalScope: toGlobalScopeRecord(globalThis),
  loadImage: (request) => {
    if (!isDefined(hostThread)) {
      return Promise.reject(
        new Error('Image loading transport is not connected'),
      );
    }

    return hostThread.imports.loadImage(request);
  },
  cancelImage: async (requestId) => {
    await hostThread?.imports.cancelImage(requestId);
  },
});

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
  pushFocusUpdate: async ({ remoteElementId, isFocusVisible }) => {
    workerActiveElementStore.setActiveElement({
      element: isDefined(remoteElementId)
        ? findElementByRemoteId({ rootNode: document.body, remoteElementId })
        : null,
      isFocusVisible,
    });
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
