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
import { setNavigate } from '@/sdk/front-component-api/functions/navigate';

import { type FrontComponentExecutionContext } from '../../types/FrontComponentExecutionContext';
import { type FrontComponentHostCommunicationApi } from '../../types/FrontComponentHostCommunicationApi';
import { type HostToWorkerRenderContext } from '../../types/HostToWorkerRenderContext';
import { type WorkerExports } from '../../types/WorkerExports';
import { exposeGlobals } from '../utils/exposeGlobals';
import { setupFetchInterceptor } from './utils/setupFetchInterceptor';
import { setWorkerEnv } from './utils/setWorkerEnv';

installStylePropertyOnRemoteElements();
patchRemoteElementSetAttribute();

exposeGlobals({
  __HTML_TAG_TO_CUSTOM_ELEMENT_TAG__: HTML_TAG_TO_CUSTOM_ELEMENT_TAG,
});

const render: WorkerExports['render'] = async (
  connection: RemoteConnection,
  renderContext: HostToWorkerRenderContext,
) => {
  if (isDefined(renderContext.apiUrl)) {
    setupFetchInterceptor({
      requestRefresh: () =>
        frontComponentWorkerThread.imports.requestAccessTokenRefresh(),
      trustedBaseUrl: renderContext.apiUrl,
    });
  }

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

  const processObject = (globalThis as Record<string, unknown>)['process'] as {
    env?: Record<string, string | undefined>;
  };
  const applicationAccessToken =
    processObject?.env?.['TWENTY_APP_ACCESS_TOKEN'];

  const response = await fetch(renderContext.componentUrl, {
    headers: isDefined(applicationAccessToken)
      ? { Authorization: `Bearer ${applicationAccessToken}` }
      : undefined,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch front component from ${renderContext.componentUrl}: ${response.status} ${response.statusText}`,
    );
  }

  const responseText = await response.text();

  const blob = new Blob([responseText], {
    type: 'application/javascript',
  });

  const importUrl = URL.createObjectURL(blob);

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
    setNavigate(frontComponentWorkerThread.imports.navigate);
  };

const updateAccessToken: WorkerExports['updateAccessToken'] = async (
  accessToken: string,
) => {
  setWorkerEnv({ TWENTY_APP_ACCESS_TOKEN: accessToken });
};

const updateContext: WorkerExports['updateContext'] = async (
  context: FrontComponentExecutionContext,
) => {
  setFrontComponentExecutionContext(context);
};

const frontComponentWorkerThread = ThreadWebWorker.self<
  FrontComponentHostCommunicationApi,
  WorkerExports
>({
  exports: {
    render,
    initializeHostCommunicationApi,
    updateAccessToken,
    updateContext,
  },
});
