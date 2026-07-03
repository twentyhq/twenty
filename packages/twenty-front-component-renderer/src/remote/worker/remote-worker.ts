import '@remote-dom/core/polyfill';
import '@remote-dom/react/polyfill';

import '../generated/remote-elements';

import { ThreadMessagePort } from '@quilted/threads';
import {
  BatchingRemoteConnection,
  type RemoteConnection,
  type RemoteRootElement,
} from '@remote-dom/core/elements';

import { isDefined } from 'twenty-shared/utils';

import { installStyleBridge } from '@/polyfills/installStyleBridge';
import { installStylePropertyOnRemoteElements } from '@/remote/utils/installStylePropertyOnRemoteElements';
import { patchRemoteElementSetAttribute } from '@/remote/utils/patchRemoteElementSetAttribute';
import { installHostFetchProxy } from './utils/installHostFetchProxy';
import { installErrorEventBridge } from './utils/installErrorEventBridge';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { frontComponentHostCommunicationApi } from '@/constants/frontComponentHostCommunicationApi';
import { HTML_TAG_TO_CUSTOM_ELEMENT_TAG } from '@/constants/HtmlTagToRemoteComponent';
import { setFrontComponentExecutionContext } from './utils/setFrontComponentExecutionContext';
import { type FrontComponentHostThreadExports } from '../../types/FrontComponentHostThreadExports';
import { type HostToWorkerRenderContext } from '../../types/HostToWorkerRenderContext';
import { type WorkerExports } from '../../types/WorkerExports';
import { exposeGlobals } from '../utils/exposeGlobals';
import {
  createOpenCommandConfirmationModalAdapter,
  handleCommandConfirmationModalResult,
} from './utils/createCommandConfirmationModalBridge';
import { setWorkerEnv } from './utils/setWorkerEnv';

installStylePropertyOnRemoteElements();
patchRemoteElementSetAttribute();
installErrorEventBridge();

exposeGlobals({
  __HTML_TAG_TO_CUSTOM_ELEMENT_TAG__: HTML_TAG_TO_CUSTOM_ELEMENT_TAG,
});

const fetchComponentSource = async (
  url: string,
  headers?: Record<string, string>,
): Promise<string> => {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
};

const SDK_IMPORT_SPECIFIERS = [
  'twenty-client-sdk/core',
  'twenty-client-sdk/metadata',
] as const;

// Rewrites bare SDK import specifiers to the blob URLs provided by the host.
const rewriteSdkImports = (
  source: string,
  sdkClientUrls: { core: string; metadata: string },
): string => {
  const specifierToBlobUrl: Record<string, string> = {
    'twenty-client-sdk/core': sdkClientUrls.core,
    'twenty-client-sdk/metadata': sdkClientUrls.metadata,
  };

  let rewritten = source;

  for (const [specifier, blobUrl] of Object.entries(specifierToBlobUrl)) {
    rewritten = rewritten
      .split(`"${specifier}"`)
      .join(`"${blobUrl}"`)
      .split(`'${specifier}'`)
      .join(`'${blobUrl}'`);
  }

  return rewritten;
};

let hostThread: ThreadMessagePort<
  FrontComponentHostThreadExports,
  WorkerExports
> | null = null;

const toOriginOrNull = (value: string | undefined): string | null => {
  if (!isDefined(value) || value.length === 0) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const toProxiedHostFetchOrigins = (
  renderContext: HostToWorkerRenderContext,
): string[] =>
  [
    renderContext.apiUrl,
    renderContext.functionsBaseUrl,
    renderContext.componentUrl,
  ]
    .map(toOriginOrNull)
    .filter(isDefined);

const render: WorkerExports['render'] = async (
  connection: RemoteConnection,
  renderContext: HostToWorkerRenderContext,
) => {
  if (isDefined(hostThread)) {
    installHostFetchProxy(
      hostThread.imports.hostFetch,
      toProxiedHostFetchOrigins(renderContext),
    );
  }

  const batchedConnection = new BatchingRemoteConnection(connection);
  const root = document.createElement('remote-root') as RemoteRootElement;
  const renderContainer = document.createElement('remote-fragment');
  root.connect(batchedConnection);
  root.append(renderContainer);
  document.body.append(root);
  installStyleBridge(root);

  if (isDefined(renderContext.applicationVariables)) {
    setWorkerEnv({
      applicationVariables: JSON.stringify(renderContext.applicationVariables),
    });
  }

  // System variables are set after application variables so they cannot be overridden
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

  const authHeaders = isDefined(renderContext.applicationAccessToken)
    ? { Authorization: `Bearer ${renderContext.applicationAccessToken}` }
    : undefined;

  const componentSource = await fetchComponentSource(
    renderContext.componentUrl,
    authHeaders,
  );

  const hasSdkImports =
    isDefined(renderContext.sdkClientUrls) &&
    SDK_IMPORT_SPECIFIERS.some((specifier) =>
      componentSource.includes(specifier),
    );

  const finalSource = hasSdkImports
    ? rewriteSdkImports(componentSource, renderContext.sdkClientUrls!)
    : componentSource;

  const componentBlob = new Blob([finalSource], {
    type: 'application/javascript',
  });

  const importUrl = URL.createObjectURL(componentBlob);

  try {
    /* @vite-ignore */
    const componentModule = await import(importUrl);

    componentModule.default(renderContainer);
  } finally {
    URL.revokeObjectURL(importUrl);
  }
};

const initializeHostCommunicationApi: WorkerExports['initializeHostCommunicationApi'] =
  async () => {
    if (!isDefined(hostThread)) {
      return;
    }

    const hostApi = hostThread.imports;

    frontComponentHostCommunicationApi.navigate = hostApi.navigate;
    frontComponentHostCommunicationApi.requestAccessTokenRefresh =
      hostApi.requestAccessTokenRefresh;
    frontComponentHostCommunicationApi.openSidePanelPage =
      hostApi.openSidePanelPage;
    frontComponentHostCommunicationApi.openCommandConfirmationModal =
      createOpenCommandConfirmationModalAdapter(hostApi);
    frontComponentHostCommunicationApi.unmountFrontComponent =
      hostApi.unmountFrontComponent;
    frontComponentHostCommunicationApi.enqueueSnackbar =
      hostApi.enqueueSnackbar;
    frontComponentHostCommunicationApi.closeSidePanel = hostApi.closeSidePanel;
    frontComponentHostCommunicationApi.updateProgress = hostApi.updateProgress;
    frontComponentHostCommunicationApi.copyToClipboard =
      hostApi.copyToClipboard;
  };

const onConfirmationModalResult: WorkerExports['onConfirmationModalResult'] =
  async (result) => {
    await handleCommandConfirmationModalResult(result);
  };

const updateContext: WorkerExports['updateContext'] = async (
  context: FrontComponentExecutionContext,
) => {
  setFrontComponentExecutionContext(context);
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
    exports: {
      render,
      initializeHostCommunicationApi,
      onConfirmationModalResult,
      updateContext,
    },
  });

  transferredPort.start();
});
