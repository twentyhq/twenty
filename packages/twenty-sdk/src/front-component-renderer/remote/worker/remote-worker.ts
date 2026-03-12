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

import { installStyleBridge } from '@/front-component-renderer/polyfills/installStyleBridge';
import { installStylePropertyOnRemoteElements } from '@/front-component-renderer/remote/utils/installStylePropertyOnRemoteElements';
import { patchRemoteElementSetAttribute } from '@/front-component-renderer/remote/utils/patchRemoteElementSetAttribute';
import { HTML_TAG_TO_CUSTOM_ELEMENT_TAG } from '@/sdk/front-component-api/constants/HtmlTagToRemoteComponent';
import { setFrontComponentExecutionContext } from '@/sdk/front-component-api/context/frontComponentContext';
import { frontComponentHostCommunicationApi } from '@/sdk/front-component-api/globals/frontComponentHostCommunicationApi';

import { type FrontComponentExecutionContext } from '@/sdk/front-component-api';
import { type FrontComponentHostCommunicationApi } from '../../types/FrontComponentHostCommunicationApi';
import {
  type HostToWorkerRenderContext,
  type SdkClientUrls,
} from '../../types/HostToWorkerRenderContext';
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

const SDK_IMPORT_SPECIFIERS: Record<string, keyof SdkClientUrls> = {
  'twenty-client-sdk/core': 'core',
  'twenty-client-sdk/metadata': 'metadata',
};

const fetchTextOrThrow = async (
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

// Fetches SDK modules that the component actually imports and returns
// a map of specifier -> blob URL. Only fetches modules that appear in the source.
const resolveSdkModules = async (
  componentSource: string,
  sdkClientUrls: SdkClientUrls | undefined,
  authHeaders: Record<string, string> | undefined,
): Promise<Record<string, string>> => {
  const blobUrls: Record<string, string> = {};

  if (!isDefined(sdkClientUrls)) {
    return blobUrls;
  }

  const fetchPromises = Object.entries(SDK_IMPORT_SPECIFIERS)
    .filter(([specifier]) => componentSource.includes(specifier))
    .map(async ([specifier, moduleKey]) => {
      const moduleSource = await fetchTextOrThrow(
        sdkClientUrls[moduleKey],
        authHeaders,
      );

      const blob = new Blob([moduleSource], {
        type: 'application/javascript',
      });

      blobUrls[specifier] = URL.createObjectURL(blob);
    });

  await Promise.all(fetchPromises);

  return blobUrls;
};

// Rewrites bare SDK import specifiers to blob URLs so the browser can resolve them.
const escapeRegExp = (string: string): string =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const rewriteSdkImports = (
  source: string,
  sdkBlobUrls: Record<string, string>,
): string => {
  let rewritten = source;

  for (const [specifier, blobUrl] of Object.entries(sdkBlobUrls)) {
    const escaped = escapeRegExp(specifier);

    rewritten = rewritten.replace(
      new RegExp(`"${escaped}"`, 'g'),
      `"${blobUrl}"`,
    );
    rewritten = rewritten.replace(
      new RegExp(`'${escaped}'`, 'g'),
      `'${blobUrl}'`,
    );
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

  const componentSource = await fetchTextOrThrow(
    renderContext.componentUrl,
    authHeaders,
  );

  const sdkBlobUrls = await resolveSdkModules(
    componentSource,
    renderContext.sdkClientUrls,
    authHeaders,
  );

  const rewrittenSource = rewriteSdkImports(componentSource, sdkBlobUrls);

  const componentBlob = new Blob([rewrittenSource], {
    type: 'application/javascript',
  });

  const importUrl = URL.createObjectURL(componentBlob);

  try {
    /* @vite-ignore */
    const componentModule = await import(importUrl);

    componentModule.default(renderContainer);
  } finally {
    URL.revokeObjectURL(importUrl);

    for (const blobUrl of Object.values(sdkBlobUrls)) {
      URL.revokeObjectURL(blobUrl);
    }
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
