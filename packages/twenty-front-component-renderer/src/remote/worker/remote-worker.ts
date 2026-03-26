import '@remote-dom/core/polyfill';
import '@remote-dom/react/polyfill';

import '../generated/remote-elements';

import { ThreadWebWorker } from '@quilted/threads';
import {
  BatchingRemoteConnection,
  type RemoteConnection,
  type RemoteRootElement,
} from '@remote-dom/core/elements';

import { isDefined } from 'twenty-shared/utils';

import { installStyleBridge } from '@/polyfills/installStyleBridge';
import { installStylePropertyOnRemoteElements } from '@/remote/utils/installStylePropertyOnRemoteElements';
import { patchRemoteElementSetAttribute } from '@/remote/utils/patchRemoteElementSetAttribute';
import { type FrontComponentExecutionContext } from 'twenty-sdk';
import { frontComponentHostCommunicationApi } from '@/constants/frontComponentHostCommunicationApi';
import { HTML_TAG_TO_CUSTOM_ELEMENT_TAG } from '@/constants/HtmlTagToRemoteComponent';
import { setFrontComponentExecutionContext } from './utils/setFrontComponentExecutionContext';
import { type FrontComponentHostCommunicationApi } from '../../types/FrontComponentHostCommunicationApi';
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

const render: WorkerExports['render'] = async (
  connection: RemoteConnection,
  renderContext: HostToWorkerRenderContext,
) => {
  const batchedConnection = new BatchingRemoteConnection(connection);
  const root = document.createElement('remote-root') as RemoteRootElement;
  const renderContainer = document.createElement('remote-fragment');
  root.connect(batchedConnection);
  root.append(renderContainer);
  document.body.append(root);
  installStyleBridge(root);

  if (isDefined(renderContext.apiUrl)) {
    setWorkerEnv({
      TWENTY_API_URL: renderContext.apiUrl,
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
    const hostApi =
      ThreadWebWorker.self.import<FrontComponentHostCommunicationApi>();

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

ThreadWebWorker.self.export({
  render,
  initializeHostCommunicationApi,
  onConfirmationModalResult,
  updateContext,
});
